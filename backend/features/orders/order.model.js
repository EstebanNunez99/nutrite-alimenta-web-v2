// backend/features/orders/order.model.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customerInfo: {
        nombre: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        // --- INICIO CAMBIO ---
        telefono: { type: String, required: true, trim: true } // Ahora es obligatorio
        // --- FIN CAMBIO ---
    },
    items: [ 
        {
            nombre: { type: String, required: true },
            cantidad: { type: Number, required: true },
            imagen: { type: String, required: true },
            precio: { type: Number, required: true },
            producto: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product'
            }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        // --- INICIO CAMBIO ---
        postalCode: { type: String, required: false }, // Ya no es obligatorio
        country: { type: String, required: false }    // Ya no es obligatorio
        // --- FIN CAMBIO ---
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

const Order = mongoose.model('Order', orderSchema);
export default Order;