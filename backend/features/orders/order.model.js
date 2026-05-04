// backend/features/orders/order.model.js
import mongoose from 'mongoose';
import { getNextSequence } from '../../shared/utils/counter.model.js';

const orderSchema = new mongoose.Schema({
    _id: { type: Number },
    customerInfo: {
        nombre: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        telefono: { type: String, required: true, trim: true }
    },
    items: [
        {
            nombre: { type: String, required: true },
            cantidad: { type: Number, required: true },
            imagen: { type: String, required: true },
            precio: { type: Number, required: true },
            tipo: { type: String, required: true, default: 'stock' },
            producto: {
                type: Number,
                required: true,
                ref: 'Product'
            }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: false },
        country: { type: String, required: false }
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'MercadoPago'
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0.0
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0.0
    },
    status: {
        type: String,
        required: true,
        enum: ['pendiente', 'completada', 'cancelada'],
        default: 'pendiente'
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    paidAt: {
        type: Date
    },
    deliveryStatus: {
        type: String,
        required: true,
        enum: ['no_enviado', 'enviado', 'entregado'],
        default: 'no_enviado'
    },
    shippingType: {
        type: String,
        enum: ['unificado', 'desglosado', 'retiro'],
        default: 'unificado'
    },
    statusInmediato: {
        type: String,
        enum: ['pendiente', 'listo', 'en_camino', 'entregado', 'n/a'],
        default: 'n/a'
    },
    fechaEntregaInmediato: {
        type: Date
    },
    statusBajoDemanda: {
        type: String,
        enum: ['pendiente', 'produccion', 'listo', 'en_camino', 'entregado', 'n/a'],
        default: 'n/a'
    },
    fechaEntregaBajoDemanda: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 20 * 60 * 1000),
        index: true
    }

}, {
    timestamps: true
});

orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        this._id = await getNextSequence('orderId');
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;