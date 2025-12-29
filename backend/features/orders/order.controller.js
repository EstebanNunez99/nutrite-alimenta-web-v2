// backend/features/orders/order.controller.js

import mongoose from 'mongoose';
import Order from './order.model.js';
import Product from '../products/product.model.js';
import { sendOrderNotification, sendDemandSummary } from '../../shared/utils/email.service.js';

// @desc    Crear una nueva orden (para invitados)
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {

    // --- CAMBIO: INICIO ELIMINACIÓN DE TRANSACCIÓN ---
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // --- FIN CAMBIO ---

    try {
        const {
            customerInfo,
            shippingAddress,
            paymentMethod,
            shippingCost,
            items,
            // Nuevos Campos RF-006
            shippingType,
            fechaEntregaInmediato,
            fechaEntregaBajoDemanda
        } = req.body;

        if (!customerInfo || !customerInfo.nombre || !customerInfo.email) {
            // await session.abortTransaction(); // Eliminado
            return res.status(400).json({ msg: 'Los datos del cliente (nombre, email) son requeridos.' });
        }
        if (!items || items.length === 0) {
            // await session.abortTransaction(); // Eliminado
            return res.status(400).json({ msg: 'No hay productos en el carrito para crear una orden.' });
        }

        const productsToUpdate = [];
        let calculatedSubtotal = 0;
        const processedItems = [];

        // Detección de tipos para establecer estados iniciales (RF-006)
        let hasStockProducts = false;
        let hasDemandProducts = false;

        for (const item of items) {
            // --- CAMBIO ---
            // Buscamos el producto sin la sesión
            const product = await Product.findById(item.producto);

            if (product) {
                if (product.tipo === 'bajo_demanda') hasDemandProducts = true;
                else hasStockProducts = true; // 'stock' o default
            }
            // --- FIN CAMBIO ---

            if (!product) {
                throw new Error(`Producto ${item.nombre} (ID: ${item.producto}) no encontrado.`);
            }

            // Validación de stock: Solo si NO es bajo demanda
            // Para 'stock', la cantidad pedida no debe superar el stock actual
            if (product.tipo !== 'bajo_demanda') {
                if (product.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para ${product.nombre}. Solo quedan ${product.stock} unidades disponibles.`);
                }
            }

            const priceFromDB = product.precio;
            calculatedSubtotal += item.cantidad * priceFromDB;

            // Solo actualizamos stock si NO es bajo demanda
            if (product.tipo !== 'bajo_demanda') {
                productsToUpdate.push({
                    updateOne: {
                        filter: { _id: product._id },
                        update: {
                            $inc: {
                                stock: -item.cantidad
                            }
                        }
                    }
                });
            }

            processedItems.push({
                nombre: product.nombre,
                cantidad: item.cantidad,
                imagen: product.imagen || '/images/sample.jpg',
                precio: priceFromDB,
                tipo: product.tipo, // Guardamos el tipo
                producto: product._id
            });
        }

        const finalShippingCost = shippingCost || 0;
        const totalPrice = calculatedSubtotal + finalShippingCost;

        const order = new Order({
            customerInfo: customerInfo,
            items: processedItems,
            shippingAddress,
            paymentMethod,
            subtotal: calculatedSubtotal,
            shippingCost: finalShippingCost,
            totalPrice: totalPrice,
            status: 'pendiente',

            // RF-006: Asignación de campos de logística avanzada
            shippingType: shippingType || 'unificado',
            statusInmediato: hasStockProducts ? 'pendiente' : 'n/a',
            statusBajoDemanda: hasDemandProducts ? 'pendiente' : 'n/a',
            fechaEntregaInmediato: fechaEntregaInmediato,
            fechaEntregaBajoDemanda: fechaEntregaBajoDemanda
        });

        // --- CAMBIO: ELIMINACIÓN DE TRANSACCIÓN ---
        // Estas operaciones ahora no son atómicas, pero funcionarán en el plan M0
        await Product.bulkWrite(productsToUpdate);
        const createdOrder = await order.save();

        // RF-010: Enviar notificación por email (async, no bloqueante)
        sendOrderNotification(createdOrder);

        // await session.commitTransaction(); // Eliminado
        // --- FIN CAMBIO ---

        res.status(201).json(createdOrder);

    } catch (error) {
        // --- CAMBIO ---
        // await session.abortTransaction(); // Eliminado
        // --- FIN CAMBIO ---
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });

    }
    // --- CAMBIO ---
    // finally {
    //     session.endSession(); // Eliminado
    // }
    // --- FIN CAMBIO ---
};

// ... (Todas las demás funciones: getOrderById, getAllOrders, updateDeliveryStatus) ...
// ... (Se quedan igual) ...
// (Tuve que omitirlas de esta respuesta para no superar el límite de caracteres, pero déjalas en tu archivo)

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ msg: 'Orden no encontrada.' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};



export const getAllOrders = async (req, res) => {
    try {
        const pageSize = 20;
        const page = Number(req.query.page) || 1;
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.deliveryStatus) filters.deliveryStatus = req.query.deliveryStatus;
        if (req.query.startDate || req.query.endDate) {
            filters.createdAt = {};
            if (req.query.startDate) filters.createdAt.$gte = new Date(req.query.startDate);
            if (req.query.endDate) filters.createdAt.$lte = new Date(req.query.endDate);
        }
        if (req.query.customerName) {
            filters['customerInfo.nombre'] = { $regex: req.query.customerName, $options: 'i' };
        }
        if (req.query.customerEmail) {
            filters['customerInfo.email'] = { $regex: req.query.customerEmail, $options: 'i' };
        }
        if (req.query.productName) {
            filters['items.nombre'] = { $regex: req.query.productName, $options: 'i' };
        }
        const count = await Order.countDocuments(filters);
        const orders = await Order.find(filters)
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));
        res.json({
            orders,
            page,
            totalPages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('Error en getAllOrders:', error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

export const updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Orden no encontrada.' });
        }
        if (!['no_enviado', 'enviado', 'entregado'].includes(deliveryStatus)) {
            return res.status(400).json({ msg: 'Estado de entrega inválido.' });
        }
        order.deliveryStatus = deliveryStatus;
        if (deliveryStatus === 'entregado') {
            order.deliveredAt = new Date();
        }
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Error al actualizar estado de entrega:', error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};

// @desc    Actualizar estados de entrega desglosados (RF-003/004)
// @route   PUT /api/orders/:id/delivery-status/split
// @access  Private/Admin
export const updateSplitDeliveryStatus = async (req, res) => {
    try {
        const { statusInmediato, statusBajoDemanda } = req.body;
        const validStatuses = ['pendiente', 'listo', 'enviado', 'entregado', 'n/a'];

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Orden no encontrada.' });
        }

        // Validaciones
        if (statusInmediato && !validStatuses.includes(statusInmediato)) {
            return res.status(400).json({ msg: 'Estado Inmediato inválido.' });
        }
        if (statusBajoDemanda && !validStatuses.includes(statusBajoDemanda)) {
            return res.status(400).json({ msg: 'Estado Bajo Demanda inválido.' });
        }

        if (statusInmediato) order.statusInmediato = statusInmediato;
        if (statusBajoDemanda) order.statusBajoDemanda = statusBajoDemanda;

        // Lógica de "deliveredAt" parcial? 
        // Si ambos están entregados (o uno entregado y otro n/a), marcamos globalmente entregado?
        // Por simplicidad, el 'deliveryStatus' global lo mantendremos sincronizado manualmente o 
        // lo dejaremos como un resumen. Vamos a actualizarlo automáticamente si podemos.

        // Auto-update global status logic (Opcional)
        const s1 = order.statusInmediato;
        const s2 = order.statusBajoDemanda;

        // Helper para saber si 'cuenta' como completado
        const isDone = (s) => s === 'entregado' || s === 'n/a';

        if (isDone(s1) && isDone(s2)) {
            order.deliveryStatus = 'entregado';
            if (!order.deliveredAt) order.deliveredAt = new Date();
        } else if (order.statusInmediato === 'enviado' || order.statusBajoDemanda === 'enviado') {
            order.deliveryStatus = 'enviado';
        }

        await order.save();
        res.json(order);

    } catch (error) {
        console.error('Error al actualizar estados desglosados:', error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
};


export const createManualOrder = async (req, res) => {
    // --- CAMBIO: INICIO ELIMINACIÓN DE TRANSACCIÓN ---
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // --- FIN CAMBIO ---

    try {
        const { customerInfo, items, shippingAddress, paymentMethod, shippingCost, status, deliveryStatus } = req.body;

        if (!customerInfo || !customerInfo.nombre || !customerInfo.email || !items || items.length === 0) {
            // await session.abortTransaction(); // Eliminado
            return res.status(400).json({ msg: 'customerInfo (nombre, email) y items son requeridos.' });
        }

        const productsToUpdate = [];
        let calculatedSubtotal = 0;

        for (const item of items) {
            // --- CAMBIO ---
            const product = await Product.findById(item.producto); // Sin .session(session)
            // --- FIN CAMBIO ---
            if (!product) {
                throw new Error(`Producto ${item.producto} no encontrado.`);
            }
            if (product.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para ${product.nombre}. Solo quedan ${product.stock} unidades disponibles.`);
            }
            const price = item.precio || product.precio;
            calculatedSubtotal += item.cantidad * price;
            productsToUpdate.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $inc: {
                            stock: -item.cantidad
                        }
                    }
                }
            });
        }

        const finalShippingCost = shippingCost || 0;
        const totalPrice = calculatedSubtotal + finalShippingCost;

        const order = new Order({
            customerInfo: customerInfo,
            items: items.map(item => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                imagen: item.imagen || '/images/sample.jpg',
                precio: item.precio,
                producto: item.producto
            })),
            shippingAddress: shippingAddress || {},
            paymentMethod: paymentMethod || 'Efectivo',
            subtotal: calculatedSubtotal,
            shippingCost: finalShippingCost,
            totalPrice: totalPrice,
            status: status || 'completada',
            deliveryStatus: deliveryStatus || 'no_enviado'
        });

        if (status === 'completada') {
            order.paidAt = new Date();
            // Eliminada logica de stockComprometido
            // Como ya descontamos el stock al "reservar" (productosToUpdate), no hacemos nada extra al completar
            // salvo marcar como pagado.
            // Si antes liberabas comprometido, ahora ya no hace falta.
            order.status = 'completada';
            order.paidAt = new Date();
        }

        // --- CAMBIO ---
        await Product.bulkWrite(productsToUpdate); // Sin { session }
        const createdOrder = await order.save(); // Sin { session }
        // await session.commitTransaction(); // Eliminado
        // --- FIN CAMBIO ---

        res.status(201).json(createdOrder);

    } catch (error) {
        // --- CAMBIO ---
        // await session.abortTransaction(); // Eliminado
        // --- FIN CAMBIO ---
        console.error(error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
    // --- CAMBIO ---
    // finally {
    //     session.endSession(); // Eliminado
    // }
    // --- FIN CAMBIO ---
};


// --- CAMBIO: INICIO ELIMINACIÓN DE CRON JOB ---
// @desc    Disparador manual para limpiar órdenes expiradas (para Cron Job)
// --- ESTA FUNCIÓN FUE ELIMINADA ---
// export const triggerOrderCleanup = async (req, res) => { ... };
// --- FIN CAMBIO ---

export const trackOrder = async (req, res) => {
    try {
        const { orderId, email } = req.body;
        if (!orderId || !email) {
            return res.status(400).json({ msg: 'Se requiere ID de orden y email.' });
        }
        const order = await Order.findOne({
            _id: orderId,
            'customerInfo.email': email.toLowerCase()
        });
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ msg: 'Orden no encontrada o el email no coincide.' });
        }
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Orden no encontrada.' });
        }
        res.status(500).json({ msg: 'Error en el servidor' });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const { id: orderId } = req.params;

    if (!status || !['completada', 'cancelada'].includes(status)) {
        return res.status(400).json({ msg: 'Estado no válido. Solo se permite "completada" o "cancelada".' });
    }

    // --- CAMBIO: INICIO ELIMINACIÓN DE TRANSACCIÓN ---
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // --- FIN CAMBIO ---

    try {
        // --- CAMBIO ---
        const order = await Order.findById(orderId); // Sin .session(session)
        // --- FIN CAMBIO ---
        if (!order) {
            // await session.abortTransaction(); // Eliminado
            return res.status(404).json({ msg: 'Orden no encontrada.' });
        }

        if (order.status === 'completada' || order.status === 'cancelada') {
            // await session.abortTransaction(); // Eliminado
            return res.status(400).json({ msg: `La orden ya está ${order.status}.` });
        }

        let productsToUpdate = [];

        if (status === 'completada') {
            // Ya no hay 'stockComprometido' que liberar. El stock se descontó al crear la orden.
            // Solo actualizamos el estado.
            order.status = 'completada';
            order.paidAt = new Date();
            order.paymentMethod = order.paymentMethod || 'Manual';

        } else if (status === 'cancelada') {
            productsToUpdate = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: {
                        $inc: {
                            stock: item.cantidad
                            // stockComprometido ya no existe
                        }
                    }
                }
            }));
            order.status = 'cancelada';
        }

        if (productsToUpdate.length > 0) {
            // --- CAMBIO ---
            await Product.bulkWrite(productsToUpdate); // Sin { session }
            // --- FIN CAMBIO ---
        }

        // --- CAMBIO ---
        const updatedOrder = await order.save(); // Sin { session }
        // await session.commitTransaction(); // Eliminado
        // --- FIN CAMBIO ---

        res.json(updatedOrder);

    } catch (error) {
        // --- CAMBIO ---
        // await session.abortTransaction(); // Eliminado
        // --- FIN CAMBIO ---
        console.error('Error al actualizar estado de orden (admin):', error);
        res.status(500).json({ msg: 'Error en el servidor', error: error.message });
    }
    // --- CAMBIO ---
    //     session.endSession(); // Eliminado
    // }
    // --- FIN CAMBIO ---
};

// @desc    Disparador manual/cron para resumen de demanda (RF-003)
// @route   POST /api/orders/summary-trigger
// @access  Private/Admin (o protegido por API Key si es externo)
export const triggerDemandSummary = async (req, res) => {
    try {
        const { date } = req.body; // Fecha de entrega opcional, o usamos "próximo cierre"

        // Logica simplificada: Si no pasan fecha, buscamos órdenes 'Bajo Demanda' pendientes de entrega
        // O buscamos las del próximo cierre estipulado.
        // Para simplificar RF-003, traeremos todas las ordenes con statusBajoDemanda != 'entregado'
        // y que tengan fechaEntregaBajoDemanda igual a la fecha pasada.

        if (!date) {
            return res.status(400).json({ msg: 'Se requiere la fecha de entrega (YYYY-MM-DD) para generar el reporte.' });
        }

        const targetDate = new Date(date);
        // Ajustar a inicio y fin del dia
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        const orders = await Order.find({
            // statusBajoDemanda: { $ne: 'n/a' }, // Solo bajo demanda
            // status: 'completada', // Solo pagadas? O todas? RF dice "solicitados", asumiremos todas las confirmadas/pendientes de pago tambien sirven para producir
            // Mejor filtrar por fechaEntregaBajoDemanda dentro del rango
            fechaEntregaBajoDemanda: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        if (orders.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron pedidos bajo demanda para esa fecha.' });
        }

        await sendDemandSummary(orders, startOfDay);

        res.json({ msg: `Resumen enviado. ${orders.length} ordenes procesadas.` });

    } catch (error) {
        console.error('Error al generar resumen:', error);
        res.status(500).json({ msg: 'Error de servidor', error: error.message });
    }
};