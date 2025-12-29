//revisado
// src/services/orderService.js

// 1. Importamos nuestro 'cerebro' centralizado de Axios
import api from '../api/axios';

// --- FUNCIONES ELIMINADAS ---
// getMyOrders (Ya no existe el historial para clientes)
// payOrder (El pago manual se reemplazó por webhooks)
// ----------------------------

/**
 * Obtiene una orden por su ID (Público).
 */
export const getOrderById = async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
};

/**
 * Crea una nueva orden (Público, para invitados).
 */
export const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};



/**
 * Rastrea una orden por ID y Email (Público).
 */
export const trackOrder = async (orderId, email) => {
    const { data } = await api.post('/orders/track', { orderId, email });
    return data;
};

// --- FUNCIONES DE ADMIN ---

/**
 * Obtener todas las órdenes (Admin)
 */
export const getAllOrders = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.deliveryStatus) queryParams.append('deliveryStatus', filters.deliveryStatus);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.customerName) queryParams.append('customerName', filters.customerName);
    if (filters.productName) queryParams.append('productName', filters.productName);

    const res = await api.get(`/orders?${queryParams.toString()}`);
    return res.data;
};

/**
 * Actualizar estado de entrega de una orden (Admin)
 */
export const updateDeliveryStatus = async (orderId, deliveryStatus) => {
    const res = await api.put(`/orders/${orderId}/delivery`, { deliveryStatus });
    return res.data;
};

/**
 * Crear orden manual (Admin)
 */
export const createManualOrder = async (orderData) => {
    const res = await api.post('/orders/manual', orderData);
    return res.data;
};

/**
 * Actualizar estado de pago de una orden (Admin)
 * Llama a: PUT /api/orders/:id/status
 */
export const updateOrderStatus = async (orderId, status) => {
    // 'status' debe ser "completada" o "cancelada"
    const res = await api.put(`/orders/${orderId}/status`, { status });
    return res.data;
};

/**
 * Actualizar estados de entrega parciaes (Inmediato / Bajo Demanda)
 * Llama a: PUT /api/orders/:id/delivery-status/split
 */
export const updateSplitDeliveryStatus = async (orderId, statusInmediato, statusBajoDemanda) => {
    const res = await api.put(`/orders/${orderId}/delivery-status/split`, {
        statusInmediato,
        statusBajoDemanda
    });
    return res.data;
};