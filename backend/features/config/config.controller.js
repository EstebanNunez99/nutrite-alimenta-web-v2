import HomeConfig from './config.model.js';

// @desc    Obtener configuración de la Home
// @route   GET /api/config/home
// @access  Public
export const getHomeConfig = async (req, res) => {
    try {
        // Buscamos el único documento de configuración y poblamos los productos
        let config = await HomeConfig.findOne().populate('featuredProducts');

        // Si no existe (primera vez), lo creamos con defaults
        if (!config) {
            config = await HomeConfig.create({});
        }

        res.json(config);
    } catch (error) {
        console.error('Error al obtener config:', error);
        res.status(500).json({ msg: 'Error de servidor' });
    }
};

// @desc    Actualizar configuración de la Home
// @route   PUT /api/config/home
// @access  Private/Admin
export const updateHomeConfig = async (req, res) => {
    try {
        const { heroTitle, heroSubtitle, bannerImage, promoMessage, featuredProducts } = req.body;

        let config = await HomeConfig.findOne();

        if (config) {
            config.heroTitle = heroTitle || config.heroTitle;
            config.heroSubtitle = heroSubtitle || config.heroSubtitle;
            config.bannerImage = bannerImage || config.bannerImage;
            config.promoMessage = promoMessage !== undefined ? promoMessage : config.promoMessage;

            // Actualizamos productos si vienen en el body (si es array vacío, se limpia)
            if (featuredProducts !== undefined) {
                config.featuredProducts = featuredProducts;
            }

            const updatedConfig = await config.save();
            // Repoplamos para devolver el objeto completo al frontend
            await updatedConfig.populate('featuredProducts');

            res.json(updatedConfig);
        } else {
            // Fallback raro si se borró la DB mientras corría
            const newConfig = await HomeConfig.create({
                heroTitle,
                heroSubtitle,
                bannerImage,
                promoMessage,
                featuredProducts: featuredProducts || []
            });
            res.status(201).json(newConfig);
        }

    } catch (error) {
        console.error('Error al actualizar config:', error);
        res.status(500).json({ msg: 'Error de servidor' });
    }
};
