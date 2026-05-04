//revisado

import mongoose from 'mongoose';
import { getNextSequence } from '../../shared/utils/counter.model.js';

const productSchema = new mongoose.Schema({
    _id: { type: Number },
    nombre: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio.'],
        trim: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria.'],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio.'],
        min: [0, 'El precio no puede ser negativo.']
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio.'],
        min: [0, 'El stock no puede ser negativo.'],
        default: 0
    },

    categoria: {
        type: [String],
        trim: true,
        default: ['General']
    },
    // RF-001/002: Clasificación de productos
    tipo: {
        type: String,
        enum: ['stock', 'bajo_demanda'],
        default: 'stock',
        required: true
    },
    imagen: {
        type: String,
        trim: true
    },
    // RF-New: Control de Vencimiento
    fechaVencimiento: {
        type: Date,
        required: false
    },
    // Relacionamos el producto con el usuario (admin) que lo creó.
    vendedor: {
        type: Number,
        ref: 'User', // Hace referencia a nuestro modelo 'User'
        required: false
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

productSchema.pre('save', async function(next) {
    if (this.isNew) {
        this._id = await getNextSequence('productId');
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;