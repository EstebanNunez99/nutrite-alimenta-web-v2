// backend/features/shipping/shipping.controller.js
import ShippingConfig from './shipping.model.js';
import axios from 'axios';

// Utilidad para obtener coordenadas de una dirección usando Google Geocode API
// (Esta función la dejamos igual)
const getCoordinates = async (address, city, postalCode, country) => {
    try {
        const fullAddress = `${address}, ${city}, ${postalCode}, ${country}`;
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            console.warn('GOOGLE_MAPS_API_KEY no está configurada. Usando cálculo de distancia aproximado.');
            return null;
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: fullAddress,
                key: apiKey
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng
            };
        }
        return null;
    } catch (error) {
        console.error('Error al obtener coordenadas:', error);
        return null;
    }
};

// ... (calculateDistance y calculateDistanceWithAPI se mantienen igual) ...
// Utilidad para calcular distancia entre dos puntos (fórmula de Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
};

// Calcular distancia usando Google Distance Matrix API si está disponible
const calculateDistanceWithAPI = async (origin, destination) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            return null;
        }

        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: `${origin.latitude},${origin.longitude}`,
                destinations: `${destination.latitude},${destination.longitude}`,
                key: apiKey,
                units: 'metric'
            }
        });

        if (response.data.status === 'OK' && response.data.rows[0]?.elements[0]?.status === 'OK') {
            const distance = response.data.rows[0].elements[0].distance.value / 1000; // Convertir a km
            return distance;
        }
        return null;
    } catch (error) {
        console.error('Error al calcular distancia con API:', error);
        return null;
    }
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

        const originCoords = config.referenceAddress.latitude && config.referenceAddress.longitude 
            ? { latitude: config.referenceAddress.latitude, longitude: config.referenceAddress.longitude }
            : null;

        // --- INICIO CAMBIO ---
        // Llamamos a getCoordinates solo con la info necesaria.
        // Fijamos "Argentina" como país y omitimos postalCode.
        const destinationCoords = await getCoordinates(
            shippingAddress.address,
            shippingAddress.city,
            '', // postalCode (omitido)
            'Argentina' // country (fijo)
        );
        // --- FIN CAMBIO ---

        let distance = 0;

        if (originCoords && destinationCoords) {
            // ... (el resto de tu lógica de cálculo de distancia es correcta) ...
            const apiDistance = await calculateDistanceWithAPI(originCoords, destinationCoords);
            if (apiDistance) {
                distance = apiDistance;
            } else {
                distance = calculateDistance(
                    originCoords.latitude,
                    originCoords.longitude,
                    destinationCoords.latitude,
                    destinationCoords.longitude
                );
            }
        } else {
            return res.json({
                cost: config.shippingRates.minimumCost,
                distance: 0,
                message: 'No se pudo calcular la distancia. Se aplicó costo mínimo.',
                estimated: true
            });
        }

        if (config.settings.maxDeliveryRadius > 0 && distance > config.settings.maxDeliveryRadius) {
            return res.status(400).json({
                msg: `La dirección está fuera del radio de entrega (máximo ${config.settings.maxDeliveryRadius} km)`,
                distance,
                maxRadius: config.settings.maxDeliveryRadius
            });
        }

        if (config.shippingRates.freeShippingDistance > 0 && distance <= config.shippingRates.freeShippingDistance) {
            return res.json({
                cost: 0,
                distance: Math.round(distance * 10) / 10,
                message: 'Envío gratuito por distancia',
                freeShipping: true
            });
        }

        // Esta lógica de costPerKm ya soporta tu idea de "precio por metro/km"
        let cost = distance * config.shippingRates.costPerKm;
        
        cost = Math.max(cost, config.shippingRates.minimumCost);
        cost = Math.min(cost, config.shippingRates.maximumCost);

        res.json({
            cost: Math.round(cost),
            distance: Math.round(distance * 10) / 10,
            estimatedDeliveryDays: config.settings.estimatedDeliveryDays
        });

    } catch (error) {
        console.error('Error al calcular costo de envío:', error);
        res.status(500).json({ msg: 'Error al calcular costo de envío', error: error.message });
    }
};