//revisado
// frontend/src/pages/OrderDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// --- CAMBIO ---
import { getOrderById } from '../services/orderService';
// --- FIN CAMBIO ---
import { toast } from 'react-toastify';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useAuth } from '../hooks/useAuth'; // Importamos useAuth
import { updateDeliveryStatus, updateSplitDeliveryStatus, resendEmail } from '../services/orderService';
// --- FIN CAMBIO ---
// --- FIN CAMBIO ---
import styles from './styles/AdminShared.module.css'; // <-- Fixed missing import

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const OrderDetailPage = () => {
    useDocumentTitle('Detalle del pedido')
    const { id: orderId } = useParams();
    // --- CAMBIO ---
    const { usuario } = useAuth(); // Obtenemos el usuario autenticado
    // --- FIN CAMBIO ---

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPaying, setIsPaying] = useState(false);

    // --- NUEVO: Enviar Email (Server-Side) ---
    const sendEmail = async () => {
        try {
            toast.info("Enviando email de confirmación...");
            await resendEmail(order._id);
            toast.success("¡Email enviado éxitosamente al cliente y admin!");
        } catch (error) {
            console.error(error);
            toast.error("Error al enviar el email.");
        }
    };
    // ---------------------------

    useEffect(() => {
        let interval = null;

        const fetchOrder = async () => {
            try {
                const data = await getOrderById(orderId);
                setOrder(data);
                setError('');
                return data;
            } catch (err) {
                // --- CAMBIO ---
                // Simplificamos el error, ya que la ruta es pública
                setError('Orden no encontrada.');
                // --- FIN CAMBIO ---
                console.error("Error al cargar la orden:", err);
                return null;
            }
        };

        const loadOrder = async () => {
            setLoading(true);
            const orderData = await fetchOrder();
            setLoading(false);

            const urlParams = new URLSearchParams(window.location.search);
            const paymentStatus = urlParams.get('status');
            if (paymentStatus === 'approved' && orderData) {
                toast.success('¡Pago aprobado! Procesando tu orden...');
            } else if (paymentStatus === 'rejected' && orderData) {
                toast.error('El pago fue rechazado. Por favor, intenta nuevamente.');
            }

            if (orderData && orderData.status === 'pendiente') {
                interval = setInterval(async () => {
                    const updatedOrder = await fetchOrder();
                    if (updatedOrder && updatedOrder.status !== 'pendiente') {
                        if (interval) clearInterval(interval);
                        if (updatedOrder.status === 'completada') {
                            toast.success('¡Pago confirmado! Tu orden ha sido procesada.');
                        }
                    }
                }, 5000);
            }
        };

        loadOrder();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [orderId]);

    // --- CAMBIO: Handlers para Admin ---
    const handleDeliveryStatusChange = async (newStatus) => {
        try {
            await updateDeliveryStatus(orderId, newStatus);
            toast.success('Estado de entrega actualizado');
            // Recargar orden
            const updated = await getOrderById(orderId);
            setOrder(updated);
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar');
        }
    };

    const handleSplitStatusChange = async (type, newStatus) => {
        try {
            await updateSplitDeliveryStatus(
                orderId,
                type === 'inmediato' ? newStatus : undefined,
                type === 'demanda' ? newStatus : undefined
            );
            toast.success('Estado actualizado');
            const updated = await getOrderById(orderId);
            setOrder(updated);
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar');
        }
    };
    // --- FIN CAMBIO ---



    if (loading) return <Spinner />;
    if (error) return <h2>{error}</h2>;

    if (!order) return <h2>Orden no encontrada.</h2>;

    const formattedTotal = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(order.totalPrice);

    // --- CAMBIO ---
    // Simplificamos la variable, 'order.items' es la correcta
    const itemsToShow = order.items || [];
    // --- FIN CAMBIO ---

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: 'var(--sombra-suave)' }}>
            <div className={styles.header}>
                <h1 className={styles.title}>Detalle de la Orden #{order.orderNumber || order._id.slice(-6).toUpperCase()}</h1>
                {usuario && usuario.rol === 'admin' && (
                    <Button onClick={sendEmail} variant="primary" style={{ marginLeft: 'auto' }}>
                        📧 Enviar Email
                    </Button>
                )}
            </div>

            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Fecha: {new Date(order.createdAt).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>

            {/* --- INICIO CAMBIO (MOSTRAR DATOS DEL INVITADO) --- */}
            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Datos del Cliente</h4>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <p style={{ margin: '0.5rem 0' }}><strong>Nombre:</strong> {order.customerInfo.nombre}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Email:</strong> {order.customerInfo.email}</p>
            </div>
            {/* --- FIN CAMBIO --- */}

            <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Resumen del Pedido</h4>
            {/* ... (renderizado de items - sin cambios) ... */}
            <div style={{ marginBottom: '1.5rem' }}>
                {itemsToShow.length > 0 ? (
                    itemsToShow.map((item, index) => (
                        <div
                            key={item._id || index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                borderBottom: '1px solid #eee',
                                gap: '1rem'
                            }}
                        >
                            <img
                                src={item.imagen || 'https://via.placeholder.com/80'}
                                alt={item.nombre}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <div style={{ flex: 1 }}>
                                <h5 style={{ margin: '0 0 0.5rem 0' }}>{item.nombre}</h5>
                                <p style={{ margin: '0', color: '#666' }}>
                                    Cantidad: {item.cantidad} x ${item.precio.toFixed(2)}
                                </p>
                            </div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                ${(item.cantidad * item.precio).toFixed(2)}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay items en esta orden.</p>
                )}
            </div>
            <hr />

            <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Dirección de Envío</h4>
            {/* ... (renderizado de dirección - sin cambios) ... */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                {order.shippingAddress.address === 'Retiro en local' ? (
                    <p style={{ margin: '0.5rem 0' }}><strong>Entrega:</strong> Retira en el domicilio o en el gimnasio según lo coordinado.</p>
                ) : (
                    <>
                        <p style={{ margin: '0.5rem 0' }}><strong>Dirección:</strong> {order.shippingAddress.address}</p>
                        <p style={{ margin: '0.5rem 0' }}><strong>Ciudad:</strong> {order.shippingAddress.city}</p>
                    </>
                )}
                {/* <p style={{ margin: '0.5rem 0' }}><strong>Código Postal:</strong> {order.shippingAddress.postalCode}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>País:</strong> {order.shippingAddress.country}</p> */}
            </div>
            <hr />

            <div style={{ textAlign: 'right', marginTop: '1.5rem', marginBottom: '2rem' }}>
                {/* ... (renderizado de totales - sin cambios) ... */}
                {order.subtotal && (
                    <div style={{ marginBottom: '0.5rem', color: '#666' }}>
                        <strong>Subtotal:</strong> {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                        }).format(order.subtotal)}
                    </div>
                )}
                {order.shippingCost !== undefined && order.shippingCost > 0 && (
                    <div style={{ marginBottom: '0.5rem', color: '#666' }}>
                        <strong>Envío:</strong> {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                        }).format(order.shippingCost)}
                    </div>
                )}
                <h3 style={{ margin: '0.5rem 0 0 0' }}>Total: {formattedTotal}</h3>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                    Método de pago: {order.paymentMethod || 'No especificado'}
                </p>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h4 style={{ marginTop: 0 }}>Estado del Pedido</h4>

                {/* ESTADO 1: COMPLETADA (Pagada) - (Sin cambios) */}
                {order.status === 'completada' ? (
                    <div>
                        <p style={{ color: 'var(--color-exito, #28a745)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            ✓ Pagado el {new Date(order.paidAt).toLocaleDateString('es-AR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        {order.paymentResult && order.paymentResult.id && (
                            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0', fontWeight: 'normal' }}>
                                Comprobante N° : {order.paymentResult.id}
                            </p>
                        )}
                        {/* LÓGICA DE ESTADOS DE ENVÍO (RF-003/004/006) */}
                        {order.shippingType === 'desglosado' ? (
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Estado de tus envíos:</p>

                                {/* 1. Stock Inmediato */}
                                {order.statusInmediato !== 'n/a' && (
                                    <div style={{ padding: '0.5rem', borderLeft: '3px solid #007bff', backgroundColor: '#f0f8ff', marginBottom: '0.5rem' }}>
                                        <strong>Stock Inmediato:</strong>
                                        <span style={{ marginLeft: '5px', color: '#007bff' }}>
                                            {order.statusInmediato === 'pendiente' ? '⏳ Pendiente' :
                                                order.statusInmediato === 'listo' ? '🎁 Listo' :
                                                    order.statusInmediato === 'enviado' ? '🚀 Enviado' :
                                                        order.statusInmediato === 'entregado' ? '✅ Entregado' : order.statusInmediato}
                                        </span>
                                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
                                            (Fecha Estimada: {new Date(order.fechaEntregaInmediato || order.createdAt).toLocaleDateString()})
                                        </div>
                                        {/* ADMIN CONTROLS */}
                                        {usuario && usuario.rol === 'admin' && (
                                            <div style={{ marginTop: '5px' }}>
                                                <select
                                                    value={order.statusInmediato}
                                                    onChange={(e) => handleSplitStatusChange('inmediato', e.target.value)}
                                                    style={{ padding: '2px', fontSize: '0.9rem' }}
                                                >
                                                    <option value="pendiente">Pendiente</option>
                                                    <option value="entregado">Entregado</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 2. Bajo Demanda */}
                                {order.statusBajoDemanda !== 'n/a' && (
                                    <div style={{ padding: '0.5rem', borderLeft: '3px solid #28a745', backgroundColor: '#f0fff4' }}>
                                        <strong>Bajo Demanda:</strong>
                                        <span style={{ marginLeft: '5px', color: '#28a745' }}>
                                            {order.statusBajoDemanda === 'pendiente' ? '⏳ Producción' :
                                                order.statusBajoDemanda === 'listo' ? '🎁 Listo' :
                                                    order.statusBajoDemanda === 'enviado' ? '🚀 Enviado' :
                                                        order.statusBajoDemanda === 'entregado' ? '✅ Entregado' : order.statusBajoDemanda}
                                        </span>
                                        <div style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
                                            (Fecha Estimada: {new Date(order.fechaEntregaBajoDemanda).toLocaleDateString()})
                                        </div>
                                        {/* ADMIN CONTROLS */}
                                        {usuario && usuario.rol === 'admin' && (
                                            <div style={{ marginTop: '5px' }}>
                                                <select
                                                    value={order.statusBajoDemanda}
                                                    onChange={(e) => handleSplitStatusChange('demanda', e.target.value)}
                                                    style={{ padding: '2px', fontSize: '0.9rem' }}
                                                >
                                                    <option value="pendiente">Pendiente</option>
                                                    <option value="entregado">Entregado</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ENVÍO UNIFICADO / RETIRO */
                            <div>
                                {order.deliveryStatus === 'entregado' ? (
                                    <p style={{ color: 'var(--color-exito, #28a745)', marginTop: '0.5rem', fontWeight: 'bold' }}>
                                        ✓ Entregado el {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('es-AR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'N/A'}
                                    </p>
                                ) : order.deliveryStatus === 'enviado' || order.statusBajoDemanda === 'enviado' ? (
                                    <p style={{ color: 'var(--color-advertencia, #ffc107)', marginTop: '0.5rem' }}>
                                        📦 En camino
                                    </p>
                                ) : (
                                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                                        ⏳ {order.shippingType === 'retiro' ? 'Pendiente de Retiro' : 'Pendiente de Envío'}
                                        {/* Mostrar fecha si aplica */}
                                        {order.fechaEntregaBajoDemanda && (
                                            <span style={{ display: 'block', fontSize: '0.9em' }}>
                                                (Programado para: {new Date(order.fechaEntregaBajoDemanda).toLocaleDateString()})
                                            </span>
                                        )}
                                    </p>
                                )}
                                {/* ADMIN CONTROLS FOR UNIFIED */}
                                {usuario && usuario.rol === 'admin' && (
                                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #ccc' }}>
                                        <small>Admin: Actualizar Estado Global</small><br />
                                        <select
                                            value={order.deliveryStatus}
                                            onChange={(e) => handleDeliveryStatusChange(e.target.value)}
                                            style={{ marginTop: '5px' }}
                                        >
                                            <option value="no_enviado">No Enviado</option>
                                            <option value="entregado">Entregado</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    // ESTADO 2: CANCELADA (Expirada) - (Sin cambios)
                ) : order.status === 'cancelada' ? (
                    <div>
                        <p style={{ color: 'var(--color-peligro, #dc3545)', fontWeight: 'bold', marginBottom: '1rem' }}>
                            ❌ Orden Cancelada
                        </p>
                        <p style={{ color: '#666' }}>
                            Esta orden expiró porque no se completó el pago a tiempo.
                            El stock ha sido devuelto. Por favor, realiza un nuevo pedido.
                        </p>
                    </div>

                    // ESTADO 3: PENDIENTE (Lista para pagar)
                ) : (
                    <div>
                        <p style={{ color: 'var(--color-advertencia, #ffc107)', fontWeight: 'bold', marginBottom: '1rem' }}>
                            ⚠ Pendiente de Pago
                        </p>
                        {/* --- CAMBIO CRÍTICO --- */}
                        {/* Eliminamos la envoltura 'if (usuario && ...)' */}
                        <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                            <p style={{ margin: 0, color: '#856404' }}>
                                <strong>Método de pago: {order.paymentMethod}</strong>
                            </p>
                            <p style={{ margin: '0.5rem 0 0 0', color: '#856404', fontSize: '0.9rem' }}>
                                Para este método de pago, contacta al vendedor para completar el pago.
                            </p>
                        </div>
                        {/* --- FIN CAMBIO --- */}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Button onClick={() => window.location.href = '/'} variant="secondary">
                    Volver al Inicio
                </Button>
                <Button onClick={() => window.location.href = '/productos'} variant="primary">
                    Volver al Catálogo
                </Button>
            </div>
        </div>
    );
};

export default OrderDetailPage;