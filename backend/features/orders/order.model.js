//revisado
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    // --- INICIO DE NUESTROS CAMBIOS ---
    // 1. Eliminamos el campo 'usuario' que referenciaba a 'User'.
    // 2. Agregamos 'customerInfo' para guardar los datos del invitado.
    customerInfo: {
        nombre: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        telefono: { type: String, trim: true, default: '' } // Opcional, pero recomendado
    },
    // --- FIN DE NUESTROS CAMBIOS ---

    // 1. Renombrado para coherencia con 'Cart'
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
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'MercadoPago' // Actualizado a tu elección
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

    // Tus comentarios y campos originales
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