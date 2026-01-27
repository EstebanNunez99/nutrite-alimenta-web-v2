import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    // Usamos esto para asegurar que sea un Singleton (una sola config)
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'general-settings'
    },
    // RF-002: El admin establece si la tienda está abierta o cerrada
    storeOpen: {
        type: Boolean,
        default: true
    },
    storeCloseMessage: {
        type: String,
        default: 'La tienda se encuentra cerrada momentáneamente.'
    },
    // RF-001: Reglas para pedidos 'Bajo Demanda'
    demandRules: {
        days: [
            {
                dayName: { type: String }, // "Miércoles"
                dayOfWeek: { type: Number, required: true }, // 0=Dom, 3=Mié, 6=Sáb
                cutoffDay: { type: Number, required: true }, // Día límite (ej: 2=Mar)
                cutoffTime: { type: String, required: true, default: "14:00" }, // Hora límite
                enabled: { type: Boolean, default: true }
            }
        ],
        // Texto general de ayuda o configuración extra
        enabled: { type: Boolean, default: true }
    },
    // RF-Global: Información del Negocio (Footer/Header)
    address: {
        type: String,
        default: 'Calle Falsa 123, Corrientes'
    },
    contactPhone: {
        type: String,
        default: '+54 379 400-0000'
    },
    contactPhoneEnabled: {
        type: Boolean,
        default: true
    },
    contactEmail: {
        type: String,
        default: 'info@nutrirte.com'
    },
    contactEmailEnabled: {
        type: Boolean,
        default: true
    },
    openingHours: {
        type: String,
        default: 'Lun a Vie: 09:00 - 18:00 hs'
    },
    socialNetworks: {
        facebook: {
            url: { type: String, default: 'https://www.facebook.com/' },
            enabled: { type: Boolean, default: true }
        },
        instagram: {
            url: { type: String, default: 'https://www.instagram.com/' },
            enabled: { type: Boolean, default: true }
        },
        twitter: {
            url: { type: String, default: 'https://x.com/' },
            enabled: { type: Boolean, default: true }
        },
        whatsapp: {
            url: { type: String, default: 'https://wa.me/' },
            enabled: { type: Boolean, default: true }
        },
        telegram: {
            url: { type: String, default: 'https://t.me/' },
            enabled: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
