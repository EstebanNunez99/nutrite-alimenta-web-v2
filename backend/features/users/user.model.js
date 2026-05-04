//verificado
import mongoose from 'mongoose';
import { getNextSequence } from '../../shared/utils/counter.model.js';

const userSchema = new mongoose.Schema({
    _id: { type: Number },
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { 
        type: String, 
        enum: ['cliente', 'admin'], 
        // default: 'cliente' // <-- Eliminado por claridad
    },
    telefono: { type: String, trim: true, default: '' },
    fotoURL: { type: String, trim: true, default: '' }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (this.isNew) {
        this._id = await getNextSequence('userId');
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;