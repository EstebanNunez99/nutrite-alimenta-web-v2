import Settings from './settings.model.js';

// @desc    Obtener configuración global
// @route   GET /api/settings
// @access  Public (Para que el frontend sepa si está abierto y reglas)
export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne({ key: 'general-settings' });

        if (!settings) {
            // Inicialización por defecto si no existe
            settings = await Settings.create({
                key: 'general-settings',
                storeOpen: true,
                demandRules: {
                    days: [
                        { dayName: 'Miércoles', dayOfWeek: 3, cutoffDay: 2, cutoffTime: '14:00', enabled: true },
                        { dayName: 'Sábado', dayOfWeek: 6, cutoffDay: 5, cutoffTime: '14:00', enabled: true }
                    ],
                    socialNetworks: {
                        facebook: { url: 'https://www.facebook.com/', enabled: true },
                        instagram: { url: 'https://www.instagram.com/', enabled: true },
                        twitter: { url: 'https://x.com/', enabled: true },
                        whatsapp: { url: 'https://wa.me/', enabled: true },
                        telegram: { url: 'https://t.me/', enabled: true }
                    }
                }
            });
        }

        // Asegurar que socialNetworks exista para registros viejos
        if (!settings.socialNetworks) {
            settings.socialNetworks = {
                facebook: { url: 'https://www.facebook.com/', enabled: true },
                instagram: { url: 'https://www.instagram.com/', enabled: true },
                twitter: { url: 'https://x.com/', enabled: true },
                whatsapp: { url: 'https://wa.me/', enabled: true },
                telegram: { url: 'https://t.me/', enabled: true }
            };
        }

        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener la configuración' });
    }
};

// @desc    Actualizar configuración global
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
    try {
        const {
            storeOpen,
            storeCloseMessage,
            demandRules,
            address,
            contactPhone,
            contactPhoneEnabled,
            contactEmail,
            contactEmailEnabled,
            openingHours,
            socialNetworks
        } = req.body;

        let settings = await Settings.findOne({ key: 'general-settings' });

        if (!settings) {
            return res.status(404).json({ msg: 'Configuración no inicializada' });
        }

        settings.storeOpen = storeOpen !== undefined ? storeOpen : settings.storeOpen;
        settings.storeCloseMessage = storeCloseMessage || settings.storeCloseMessage;

        // Actualizamos campos de contacto si vienen
        if (address !== undefined) settings.address = address;
        if (contactPhone !== undefined) settings.contactPhone = contactPhone;
        if (contactPhoneEnabled !== undefined) settings.contactPhoneEnabled = contactPhoneEnabled;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        if (contactEmailEnabled !== undefined) settings.contactEmailEnabled = contactEmailEnabled;
        if (openingHours !== undefined) settings.openingHours = openingHours;

        if (demandRules) {
            settings.demandRules = demandRules;
        }

        if (socialNetworks) {
            settings.socialNetworks = socialNetworks;
        }

        const updatedSettings = await settings.save();
        res.json(updatedSettings);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar la configuración' });
    }
};
