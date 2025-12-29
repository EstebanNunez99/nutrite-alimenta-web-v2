// backend/features/shipping/shipping.controller.js
import ShippingConfig from './shipping.model.js';
import axios from 'axios';

// Utilidad para obtener coordenadas (SIMULADA - Ya no usa Google Maps)
const getCoordinates = async (address, city, postalCode, country) => {
    // Retornamos null o un valor dummy porque ya no calculamos distancia real
    return null;
};

// Utilidad para calcular distancia (Simplificada)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return 0; // Sin cálculo real
};

// Calcular distancia con API (Google Maps eliminado)
const calculateDistanceWithAPI = async (origin, destination) => {
    return null;
};

// @desc    Obtener configuración de envío
// @route   GET /api/shipping/config
// @access  Private/Admin
export const getShippingConfig = async (req, res) => {
    try {
        const config = await ShippingConfig.getConfig();
        res.json(config);
    } catch (error) {
        console.error('Error al obtener configuración de envío:', error);
        res.status(500).json({ msg: 'Error al obtener configuración de envío', error: error.message });
    }
};

// @desc    Actualizar configuración de envío
// @route   PUT /api/shipping/config
// @access  Private/Admin
export const updateShippingConfig = async (req, res) => {
    try {
        const { referenceAddress, shippingRates, settings } = req.body;

        // Obtener coordenadas de la dirección de referencia si está presente
        if (referenceAddress && referenceAddress.address) {
            // --- INICIO CAMBIO ---
            // Asumimos que la tienda está en Resistencia, Argentina.
            // Ya no usamos postalCode.
            const coords = await getCoordinates(
                referenceAddress.address,
                referenceAddress.city || 'Resistencia', // Fallback a Resistencia
                '', // postalCode se omite
                'Argentina' // Se fija el país
            );
            // --- FIN CAMBIO ---
            if (coords) {
                referenceAddress.latitude = coords.latitude;
                referenceAddress.longitude = coords.longitude;
            }
        }

        let config = await ShippingConfig.findOne();

        if (!config) {
            config = new ShippingConfig({
                referenceAddress: referenceAddress || {},
                shippingRates: shippingRates || {},
                settings: settings || {}
            });
        } else {
            if (referenceAddress) config.referenceAddress = { ...config.referenceAddress, ...referenceAddress };
            if (shippingRates) config.shippingRates = { ...config.shippingRates, ...shippingRates };
            if (settings) config.settings = { ...config.settings, ...settings };
        }

        await config.save();
        res.json(config);
    } catch (error) {
        console.error('Error al actualizar configuración de envío:', error);
        res.status(500).json({ msg: 'Error al actualizar configuración de envío', error: error.message });
    }
};

// @desc    Calcular costo de envío
// @route   POST /api/shipping/calculate
// @access  Public (se usa en checkout)
export const calculateShippingCost = async (req, res) => {
    try {
        const { shippingAddress, orderTotal } = req.body;

        if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
            return res.status(400).json({ msg: 'Se requiere dirección y ciudad de envío' });
        }

        const config = await ShippingConfig.getConfig();

        if (!config.settings.isEnabled) {
            return res.json({
                cost: 0,
                distance: 0,
                message: 'Envío deshabilitado'
            });
        }

        if (config.shippingRates.freeShippingAmount > 0 && orderTotal >= config.shippingRates.freeShippingAmount) {
            return res.json({
                cost: 0,
                distance: 0,
                message: 'Envío gratuito por compra mínima',
                freeShipping: true
            });
        }

        // Lógica simplificada: Envío siempre a convenir (Uber Motos)
        // Retornamos costo 0 (el cliente paga al recibir) y mensaje informativo
        return res.json({
            cost: 0,
            distance: 0,
            message: 'Envío con Uber Motos (A cargo del cliente).',
            estimatedDeliveryDays: config.settings.estimatedDeliveryDays
        });

    } catch (error) {
        console.error('Error al calcular costo de envío:', error);
        res.status(500).json({ msg: 'Error al calcular costo de envío', error: error.message });
    }
};