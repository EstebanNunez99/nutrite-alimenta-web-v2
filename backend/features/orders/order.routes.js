//revisado
import express from 'express';
import { 
    createOrder, 
    // getMyOrders, // Eliminada
    getOrderById, 
    // updateOrderToPaid, // Eliminada
    createMercadoPagoPreference,
    receiveMercadoPagoWebhook,
    // triggerOrderCleanup,
    getAllOrders,
    updateDeliveryStatus,
    createManualOrder,
    trackOrder,
    updateOrderStatus
} from './order.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../shared/middlewares/adminMiddleware.js';

const router = express.Router();


// --- RUTAS PÚBLICAS ---
// (No requieren autenticación)

// Endpoint para cron job
// router.get('/trigger-cron', triggerOrderCleanup);

// Ruta pública para el Webhook de MercadoPago
router.post('/webhook/mercadopago', receiveMercadoPagoWebhook);

// Crear nueva orden (para invitados)
router.post('/', createOrder);

// Nueva ruta de seguimiento de orden (para invitados)
router.post('/track', trackOrder);

// Obtener una orden por ID (público para página de éxito/seguimiento)
router.get('/:id', getOrderById);

// Crear preferencia de pago (público, se llama después de crear la orden)
router.post('/:id/create-payment-preference', createMercadoPagoPreference);


// --- RUTAS DE ADMINISTRADOR ---
// (Requieren autenticación y rol de admin)
// Aplicamos los middlewares directamente a cada ruta de admin

// Obtener todas las órdenes (Admin)
router.get('/', authMiddleware, adminMiddleware, getAllOrders);

// Crear orden manual (Admin)
router.post('/manual', authMiddleware, adminMiddleware, createManualOrder);

// Actualizar estado de entrega (Admin)
router.put('/:id/delivery', authMiddleware, adminMiddleware, updateDeliveryStatus);

router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;