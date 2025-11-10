//revisado
// frontend/src/pages/OrderDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// --- CAMBIO ---
import { getOrderById, createMercadoPagoPreference } from '../services/orderService';
// import { useAuth } from '../hooks/useAuth'; // <-- Eliminado
// --- FIN CAMBIO ---
import { toast } from 'react-toastify';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle'

const OrderDetailPage = () => {
    useDocumentTitle('Detalle del pedido')
    const { id: orderId } = useParams();
    // --- CAMBIO ---
    // const { usuario } = useAuth(); // <-- Eliminado
    // --- FIN CAMBIO ---

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPaying, setIsPaying] = useState(false);

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

    const handlePayment = async () => {
        setIsPaying(true);
        toast.info('Redirigiendo a MercadoPago...');
        try {
            const preference = await createMercadoPagoPreference(orderId);
            if (preference.init_point) {
                window.location.href = preference.init_point;
            } else {
                throw new Error('No se pudo obtener la URL de pago.');
            }
        } catch (err) {
            toast.error('Hubo un error al generar el link de pago.');
            console.error("Error al crear preferencia de MP:", err);
            setIsPaying(false);
        }
    };

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
            <h2>Detalle de la Orden #{order._id}</h2>
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
                <p style={{ margin: '0.5rem 0' }}><strong>Dirección:</strong> {order.shippingAddress.address}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Ciudad:</strong> {order.shippingAddress.city}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>Código Postal:</strong> {order.shippingAddress.postalCode}</p>
                <p style={{ margin: '0.5rem 0' }}><strong>País:</strong> {order.shippingAddress.country}</p>
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
                        ) : order.deliveryStatus === 'enviado' ? (
                            <p style={{ color: 'var(--color-advertencia, #ffc107)', marginTop: '0.5rem' }}>
                                📦 En cámiino
                            </p>
                        ) : (
                            <p style={{ color: '#666', marginTop: '0.5rem' }}>
                                ⏳ Pendiente de envío
                            </p>
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
                        <>
                            {order.paymentMethod === 'MercadoPago' ? (
                                <Button
                                    onClick={handlePayment}
                                    variant="primary"
                                    disabled={isPaying}
                                >
                                    {isPaying ? 'Generando link de pago...' : 'Pagar con MercadoPago'}
                                </Button>
                            ) : (
                                <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                                    <p style={{ margin: 0, color: '#856404' }}>
                                        <strong>Método de pago: {order.paymentMethod}</strong>
                                    </p>
                                    <p style={{ margin: '0.5rem 0 0 0', color: '#856404', fontSize: '0.9rem' }}>
                                        Para este método de pago, contacta al vendedor para completar el pago.
                                    </p>
                                </div>
                            )}
                        </>
                        {/* --- FIN CAMBIO --- */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;