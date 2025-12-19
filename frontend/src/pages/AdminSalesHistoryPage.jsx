// frontend/src/pages/AdminSalesHistoryPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// --- CAMBIO ---
// Importamos la nueva función updateOrderStatus y updateSplitDeliveryStatus
import { getAllOrders, updateDeliveryStatus, updateOrderStatus, updateSplitDeliveryStatus } from '../services/orderService';
// --- FIN CAMBIO ---
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import useDocumentTitle from '../hooks/useDocumentTitle';
import styles from './styles/AdminSalesHistoryPage.module.css';

const AdminSalesHistoryPage = () => {
    useDocumentTitle('Admin - Historial de Ventas');
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        status: '',
        deliveryStatus: '',
        startDate: '',
        endDate: '',
        customerName: '',
        productName: ''
    });

    useEffect(() => {
        loadOrders();
    }, [page, filters]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllOrders({ ...filters, page });
            setOrders(data.orders);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch (error) {
            console.error('Error al cargar órdenes:', error);
            toast.error('Error al cargar el historial de ventas');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(1);
    };

    const handleDeliveryStatusChange = async (orderId, newStatus) => {
        try {
            await updateDeliveryStatus(orderId, newStatus);
            toast.success('Estado de entrega actualizado');
            loadOrders();
        } catch (error) {
            console.error('Error al actualizar estado de entrega:', error);
            toast.error('Error al actualizar el estado de entrega');
        }
    };

    // --- CAMBIO ---
    // Nueva función para manejar el cambio de estado de pago
    const handleStatusChange = async (orderId, newStatus) => {
        if (!window.confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"? Esto afectará el stock.`)) {
            return;
        }
        try {
            await updateOrderStatus(orderId, newStatus);
            toast.success(`Orden marcada como ${newStatus}`);
            loadOrders();
        } catch (error) {
            console.error('Error al actualizar estado de pago:', error);
            toast.error(error.response?.data?.msg || 'Error al actualizar el estado de pago');
        }
    };

    // Nueva función para manejar estados desglosados
    const handleSplitStatusChange = async (orderId, type, newStatus) => {
        // type: 'inmediato' | 'demanda'
        try {
            await updateSplitDeliveryStatus(
                orderId,
                type === 'inmediato' ? newStatus : undefined,
                type === 'demanda' ? newStatus : undefined
            );
            toast.success('Estado actualizado');
            loadOrders();
        } catch (error) {
            console.error('Error updating split status:', error);
            toast.error('Error al actualizar estado');
        }
    };
    // --- FIN CAMBIO ---

    const getStatusBadge = (status) => {
        const badges = {
            pendiente: { label: 'Pendiente', class: styles.badgeWarning },
            completada: { label: 'Completada', class: styles.badgeSuccess },
            cancelada: { label: 'Cancelada', class: styles.badgeDanger }
        };
        return badges[status] || { label: status, class: styles.badgeDefault };
    };

    const getDeliveryStatusBadge = (deliveryStatus) => {
        const badges = {
            no_enviado: { label: 'No Enviado', class: styles.badgeDefault },
            enviado: { label: 'Enviado', class: styles.badgeWarning },
            entregado: { label: 'Entregado', class: styles.badgeSuccess }
        };
        return badges[deliveryStatus] || { label: deliveryStatus, class: styles.badgeDefault };
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
        }).format(amount);
    };

    if (loading && orders.length === 0) {
        return <Spinner />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Historial de Ventas</h2>
                <Button onClick={() => navigate('/admin/orders/manual')} variant="primary">
                    + Nueva Venta
                </Button>
            </div>

            {/* ... (Sección de Filtros - sin cambios) ... */}
            <div className={styles.filters}>
                <h3>Filtros</h3>
                <div className={styles.filterGrid}>
                    <div>
                        <label>Estado de Pago</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="completada">Completada</option>
                            <option value="cancelada">Cancelada</option>
                        </select>
                    </div>

                    <div>
                        <label>Estado de Entrega</label>
                        <select
                            value={filters.deliveryStatus}
                            onChange={(e) => handleFilterChange('deliveryStatus', e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="no_enviado">No Enviado</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                        </select>
                    </div>

                    <div>
                        <label>Fecha Desde</label>
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Fecha Hasta</label>
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Nombre del Cliente</label>
                        <Input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={filters.customerName}
                            onChange={(e) => handleFilterChange('customerName', e.target.value)}
                        />
                    </div>

                    <div>
                        <label>Producto</label>
                        <Input
                            type="text"
                            placeholder="Buscar por producto..."
                            value={filters.productName}
                            onChange={(e) => handleFilterChange('productName', e.target.value)}
                        />
                    </div>
                </div>

                <Button
                    onClick={() => {
                        setFilters({
                            status: '',
                            deliveryStatus: '',
                            startDate: '',
                            endDate: '',
                            customerName: '',
                            productName: ''
                        });
                        setPage(1);
                    }}
                    variant="secondary"
                >
                    Limpiar Filtros
                </Button>
            </div>

            <div className={styles.summary}>
                <p>Total de órdenes: <strong>{total}</strong></p>
            </div>
            <p>*Poner estados de Entrega mas desciptivos, capaz cambiar por Estado de pedido 'Aceptado' 'Entregado'</p>
            <div className={styles.tableContainer}>
                {orders.length === 0 ? (
                    <p className={styles.noData}>No se encontraron órdenes</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado Pago</th>
                                <th>Logística / Entrega</th>
                                {/* --- CAMBIO --- */}
                                <th>Acciones</th>
                                {/* --- FIN CAMBIO --- */}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const statusBadge = getStatusBadge(order.status);
                                const deliveryBadge = getDeliveryStatusBadge(order.deliveryStatus);

                                return (
                                    <tr key={order._id}>
                                        <td>
                                            <button
                                                className={styles.orderLink}
                                                onClick={() => navigate(`/orden/${order._id}`)}
                                            >
                                                {order._id.substring(0, 8)}...
                                            </button>
                                        </td>
                                        <td>
                                            {order.customerInfo?.nombre || 'N/A'}
                                            <br />
                                            <small>{order.customerInfo?.email || ''}</small>
                                        </td>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>{formatCurrency(order.totalPrice)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${statusBadge.class}`}>
                                                {statusBadge.label}
                                            </span>
                                            {/* --- CAMBIO: Selector de estado de pago --- */}
                                            {order.status === 'pendiente' && (
                                                <select
                                                    className={styles.statusSelect}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                                                >
                                                    <option value="pendiente">Pendiente</option>
                                                    <option value="completada">Marcar Pagada</option>
                                                    <option value="cancelada">Cancelar Orden</option>
                                                </select>
                                            )}
                                            {/* --- FIN CAMBIO --- */}
                                        </td>
                                        <td>
                                            {/* LOGISTICA SPLIT (RF-003/004/006) */}
                                            <div className={styles.logisticsCell}>
                                                <small style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#555' }}>
                                                    {order.shippingType ? order.shippingType.toUpperCase() : 'STANDARD'}
                                                </small>

                                                {/* SI ES DESGLOSADO: Mostramos dos selectores */}
                                                {order.shippingType === 'desglosado' ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>

                                                        {/* Inmediato */}
                                                        {order.statusInmediato !== 'n/a' && (
                                                            <div style={{ borderLeft: '3px solid #007bff', paddingLeft: '5px' }}>
                                                                <small>Stock YA ({new Date(order.fechaEntregaInmediato || order.createdAt).toLocaleDateString()}):</small>
                                                                <select
                                                                    className={styles.miniSelect}
                                                                    value={order.statusInmediato}
                                                                    onChange={(e) => handleSplitStatusChange(order._id, 'inmediato', e.target.value)}
                                                                    disabled={order.status !== 'completada'}
                                                                >
                                                                    <option value="pendiente">Pendiente</option>
                                                                    <option value="listo">Listo</option>
                                                                    <option value="enviado">Enviado</option>
                                                                    <option value="entregado">Entregado</option>
                                                                </select>
                                                            </div>
                                                        )}

                                                        {/* Bajo Demanda */}
                                                        {order.statusBajoDemanda !== 'n/a' && (
                                                            <div style={{ borderLeft: '3px solid #28a745', paddingLeft: '5px' }}>
                                                                <small>Demanda ({new Date(order.fechaEntregaBajoDemanda).toLocaleDateString()}):</small>
                                                                <select
                                                                    className={styles.miniSelect}
                                                                    value={order.statusBajoDemanda}
                                                                    onChange={(e) => handleSplitStatusChange(order._id, 'demanda', e.target.value)}
                                                                    disabled={order.status !== 'completada'}
                                                                >
                                                                    <option value="pendiente">Pendiente</option>
                                                                    <option value="listo">Listo</option>
                                                                    <option value="enviado">Enviado</option>
                                                                    <option value="entregado">Entregado</option>
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    /* SI ES UNIFICADO o RETIRO (O LEGACY): Mostramos uno solo */
                                                    /* Si tiene statusBajoDemanda activo, usamos ese como principal. Si no, Inmediato. */
                                                    <div>
                                                        {order.statusBajoDemanda && order.statusBajoDemanda !== 'n/a' ? (
                                                            <>
                                                                <small>Entrega ({new Date(order.fechaEntregaBajoDemanda || order.createdAt).toLocaleDateString()}):</small>
                                                                <select
                                                                    className={styles.miniSelect}
                                                                    value={order.statusBajoDemanda}
                                                                    onChange={(e) => handleSplitStatusChange(order._id, 'demanda', e.target.value)}
                                                                    disabled={order.status !== 'completada'}
                                                                >
                                                                    <option value="pendiente">Pendiente</option>
                                                                    <option value="listo">Listo</option>
                                                                    <option value="enviado">Enviado</option>
                                                                    <option value="entregado">Entregado</option>
                                                                </select>
                                                            </>
                                                        ) : (
                                                            /* Fallback a DeliveryStatus legacy o Inmediato */
                                                            <select
                                                                className={styles.miniSelect}
                                                                value={order.deliveryStatus || 'no_enviado'}
                                                                onChange={(e) => handleDeliveryStatusChange(order._id, e.target.value)}
                                                                disabled={order.status !== 'completada'}
                                                            >
                                                                <option value="no_enviado">Pendiente</option>
                                                                <option value="enviado">Enviado</option>
                                                                <option value="entregado">Entregado</option>
                                                            </select>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <Button
                                                variant="secondary"
                                                onClick={() => navigate(`/orden/${order._id}`)}
                                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                                            >
                                                Ver Detalle
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ... (Paginación - sin cambios) ... */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <Button
                        variant="secondary"
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                    >
                        Anterior
                    </Button>
                    <span>Página {page} de {totalPages}</span>
                    <Button
                        variant="secondary"
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AdminSalesHistoryPage;