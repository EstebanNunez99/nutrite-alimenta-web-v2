//verificado
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// --- Carga de Rutas y Configuración ---
import conectarDB from './config/db.js';

// --- CAMBIO ---
// 1. Importamos las rutas de autenticación
import authRoutes from './features/auth/auth.routes.js';
// 2. Mantenemos las rutas de usuario (para /profile)
import userRoutes from './features/users/user.routes.js';
import productRoutes from './features/products/product.routes.js'
// 3. Eliminamos las rutas del carrito
// import cartRoutes from './features/cart/cart.routes.js'; 
import orderRoutes from './features/orders/order.routes.js';
import shippingRoutes from './features/shipping/shipping.routes.js';
import settingsRoutes from './features/settings/settings.routes.js';
// --- FIN CAMBIO ---

// 1. Cargar Variables de Entorno
dotenv.config();

// Verificar variables críticas al inicio
if (!process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI no está definida en el archivo .env');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET no está definida en el archivo .env');
    process.exit(1);
}

// 2. Crear la App de Express
const app = express();

// 3. Conectar a la Base de Datos
conectarDB();

// 4. Middlewares
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            process.env.FRONTEND_URL,
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ].filter(Boolean); // Filtrar valores nulos/undefined

        if (!origin) return callback(null, true);
        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }

        console.log('Bloqueado por CORS:', origin); // Log para depuración
        return callback(new Error('No permitido por CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json({ extended: true })); // Para poder leer JSON en el body

// 5. Definir el Puerto
const PORT = process.env.PORT || 4000;

// 6. Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'backend'
    });
});

// 7. Cargar Módulos de Rutas
console.log('Cargando ruta de autenticación en /api/auth');
app.use('/api/auth', authRoutes); // <-- AÑADIDO

console.log('Cargando ruta de usuarios en /api/users');
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
// app.use('/api/cart', cartRoutes); // <-- ELIMINADO
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/settings', settingsRoutes);

// 8. Iniciar el Servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`El servidor está funcionando en el puerto ${PORT}`);
});