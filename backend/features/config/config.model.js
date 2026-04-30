import mongoose from 'mongoose';

const homeConfigSchema = mongoose.Schema({
    heroTitle: {
        type: String,
        default: 'Nutrición Consciente'
    },
    heroSubtitle: {
        type: String,
        default: 'Alimentos naturales para tu bienestar.'
    },
    bannerImage: {
        type: String,
        // este es el viejo default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop'
        default: 'https://res.cloudinary.com/drk7ixxdm/image/upload/v1773599772/slqasyouipbiinser0b5.png'
    },
    // Podriamos agregar mas cosas a futuro, como "Promo del mes"
    promoMessage: {
        type: String,
        default: ''
    },
    // RF-New: Productos Destacados Manuales
    featuredProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {
    timestamps: true
});

const HomeConfig = mongoose.model('HomeConfig', homeConfigSchema);

export default HomeConfig;
