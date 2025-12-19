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
                    ]
                }
            });
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
        const { storeOpen, storeCloseMessage, demandRules } = req.body;

        let settings = await Settings.findOne({ key: 'general-settings' });

        if (!settings) {
            return res.status(404).json({ msg: 'Configuración no inicializada' });
        }

        settings.storeOpen = storeOpen !== undefined ? storeOpen : settings.storeOpen;
        settings.storeCloseMessage = storeCloseMessage || settings.storeCloseMessage;

        if (demandRules) {
            settings.demandRules = demandRules;
        }

        const updatedSettings = await settings.save();
        res.json(updatedSettings);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar la configuración' });
    }
};
