// backend/features/orders/order.controller.js
import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from 'mercadopago';
import mongoose from 'mongoose';
import Order from './order.model.js';
import Product from '../products/product.model.js';

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

            const stockDisponible = product.stock - product.stockComprometido;

            if (stockDisponible < item.cantidad) {
                throw new Error(`Stock insuficiente para ${product.nombre}. Solo quedan ${stockDisponible} unidades disponibles.`);
            }

            const priceFromDB = product.precio;
            calculatedSubtotal += item.cantidad * priceFromDB;

            productsToUpdate.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $inc: {
                            stock: -item.cantidad,
                            stockComprometido: item.cantidad
                        }
                    }
                }
            });

            processedItems.push({
                nombre: product.nombre,
                cantidad: item.cantidad,
                imagen: product.imagen || '/images/sample.jpg',
                precio: priceFromDB,
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

// ... (Todas las demás funciones: getOrderById, createMercadoPagoPreference, receiveMercadoPagoWebhook, getAllOrders, updateDeliveryStatus) ...
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

export const createMercadoPagoPreference = async (req, res) => {
    try {
        const { id: orderId } = req.params;
        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            console.error('ERROR: MERCADOPAGO_ACCESS_TOKEN no está definido en .env');
            return res.status(500).json({ msg: 'Error de configuración del servidor (MP Token).' });
        }
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
        const backendURL = process.env.BACKEND_URL || 'http://localhost:4000';
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: 'Orden no encontrada.' });
        }
        if (order.status !== 'pendiente') {
            return res.status(400).json({ msg: 'Esta orden no está pendiente de pago.' });
        }
        if (order.paymentMethod !== 'MercadoPago') {
            return res.status(400).json({ msg: 'El método de pago de esta orden no es MercadoPago.' });
        }
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        });
        const preference = new Preference(client);
        const items = order.items.map(item => ({
            id: item.producto.toString(),
            title: item.nombre,
            quantity: item.cantidad,
            unit_price: item.precio,
            currency_id: 'ARS',
            picture_url: item.imagen,
            description: item.nombre,
        }));
        if (order.shippingCost > 0) {
            items.push({
                id: 'shipping',
                title: 'Costo de Envío',
                quantity: 1,
                unit_price: order.shippingCost,
                currency_id: 'ARS',
                description: 'Costo de envío'
            });
        }
        const preferenceBody = {
            items: items,
            payer: {
                name: order.customerInfo.nombre.split(' ')[0],
                surname: order.customerInfo.nombre.split(' ').slice(1).join(' ') || order.customerInfo.nombre,
                email: order.customerInfo.email,
            },
            back_urls: {
                success: `${frontendURL}/orden/${orderId}`,
                failure: `${frontendURL}/orden/${orderId}`,
                pending: `${frontendURL}/orden/${orderId}`
            },
            external_reference: orderId,
            notification_url: `${backendURL}/api/orders/webhook/mercadopago`
        };
        console.log('Creando preferencia de MercadoPago...');
        const result = await preference.create({ body: preferenceBody });
        res.json({
            id: result.id,
            init_point: result.init_point
        });
    } catch (error) {
        console.error('Error al crear preferencia de MercadoPago:', error);
        if (error.response && error.response.data) {
            console.error('Detalle del error de MP:', error.response.data);
            return res.status(500).json({
                msg: 'Error del servidor de MercadoPago',
                error: error.response.data
            });
        }
        res.status(500).json({
            msg: 'Error en el servidor al crear preferencia',
            error: error.message
        });
    }
};

export const receiveMercadoPagoWebhook = async (req, res) => {
    console.log('[MP Webhook] Notificación recibida.');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    try {
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
        });
        let paymentDetails = null;
        let paymentId = null;
        if (req.body.type === 'payment') {
            paymentId = req.body.data.id;
            console.log(`[MP Webhook] Recibido 'type: payment' con ID: ${paymentId}`);
            const payment = new Payment(client);
            paymentDetails = await payment.get({ id: paymentId });
        } else if (req.body.topic === 'merchant_order') {
            const merchantOrderId = req.body.resource.split('/').pop();
            console.log(`[MP Webhook] Recibido 'topic: merchant_order' con ID: ${merchantOrderId}`);
            const merchantOrder = new MerchantOrder(client);
            const orderInfo = await merchantOrder.get({ merchantOrderId });
            if (orderInfo.payments && orderInfo.payments.length > 0) {
                const lastPaymentInfo = orderInfo.payments[orderInfo.payments.length - 1];
                paymentId = lastPaymentInfo.id;
                console.log(`[MP Webhook] MerchantOrder contenía Payment ID: ${paymentId}`);
                const payment = new Payment(client);
                paymentDetails = await payment.get({ id: paymentId });
            } else {
                console.log(`[MP Webhook] MerchantOrder ${merchantOrderId} no contenía pagos.`);
            }
        } else {
            console.log(`[MP Webhook] Evento ignorado: tipo '${req.body.type}' y tópico '${req.body.topic}' desconocidos.`);
            return res.status(200).send('Evento no reconocido.');
        }
        if (!paymentDetails) {
            console.log('[MP Webhook] No se pudieron obtener detalles del pago.');
            return res.status(200).send('Sin detalles de pago para procesar.');
        }
        console.log(`[MP Webhook] Estado del pago: ${paymentDetails.status}`);
        console.log(`[MP Webhook] External Reference (Order ID): ${paymentDetails.external_reference}`);
        const orderId = paymentDetails.external_reference;
        const paymentStatus = paymentDetails.status;
        if (!orderId) {
            console.log('[MP Webhook] Error: El pago no tiene external_reference (Order ID).');
            return res.status(400).send('Pago sin external_reference.');
        }
        const order = await Order.findById(orderId);
        if (!order) {
            console.log(`[MP Webhook] Error: Orden ${orderId} no encontrada en la BD.`);
            return res.status(404).send('Orden no encontrada.');
        }
        if (order.status === 'completada') {
            console.log(`[MP Webhook] Orden ${orderId} ya estaba 'completada'. Ignorando.`);
            return res.status(200).send('Orden ya procesada.');
        }
        if (paymentStatus === 'approved') {
            console.log(`[MP Webhook] Pago 'approved' para Orden ${orderId}. Actualizando stock...`);
            const productsToUpdate = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: {
                        $inc: { stockComprometido: -item.cantidad }
                    }
                }
            }));
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                await Product.bulkWrite(productsToUpdate, { session });
                order.status = 'completada';
                order.paidAt = new Date(paymentDetails.date_approved);
                order.paymentResult = {
                    id: paymentDetails.id,
                    status: paymentDetails.status,
                    update_time: paymentDetails.date_updated,
                    email_address: paymentDetails.payer.email
                };
                await order.save({ session });
                await session.commitTransaction();
                console.log(`[MP Webhook] ¡ÉXITO! Orden ${orderId} actualizada a 'completada' y stock liberado.`);
            } catch (dbError) {
                await session.abortTransaction();
                console.error(`[MP Webhook] Error de BD al actualizar orden ${orderId}:`, dbError);
                return res.status(500).send('Error interno al actualizar la orden.');
            } finally {
                session.endSession();
            }
        } else {
            console.log(`[MP Webhook] Estado de pago no 'approved' (${paymentStatus}). No se actualiza orden.`);
        }
        res.status(200).send('Webhook recibido exitosamente.');
    } catch (error) {
        console.error('--- ERROR en Webhook de MercadoPago ---', error);
        if (error.response && error.response.data) {
            console.error('Detalle del error de API MP:', error.response.data);
        }
        res.status(500).json({ msg: 'Error en el servidor al procesar webhook', error: error.message });
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
            const stockDisponible = product.stock - product.stockComprometido;
            if (stockDisponible < item.cantidad) {
                throw new Error(`Stock insuficiente para ${product.nombre}. Solo quedan ${stockDisponible} unidades disponibles.`);
            }
            const price = item.precio || product.precio;
            calculatedSubtotal += item.cantidad * price;
            productsToUpdate.push({
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $inc: {
                            stock: -item.cantidad,
                            stockComprometido: item.cantidad
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
            const productsToRelease = items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: {
                        $inc: { stockComprometido: -item.cantidad }
                    }
                }
            }));
            // --- CAMBIO ---
            await Product.bulkWrite(productsToRelease); // Sin { session }
            // --- FIN CAMBIO ---
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
            productsToUpdate = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: {
                        $inc: { stockComprometido: -item.cantidad }
                    }
                }
            }));
            order.status = 'completada';
            order.paidAt = new Date();
            order.paymentMethod = order.paymentMethod || 'Manual';

        } else if (status === 'cancelada') {
            productsToUpdate = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.producto },
                    update: {
                        $inc: {
                            stock: item.cantidad,
                            stockComprometido: -item.cantidad
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
    // finally {
    //     session.endSession(); // Eliminado
    // }
    // --- FIN CAMBIO ---
};