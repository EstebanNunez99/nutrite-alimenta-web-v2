//verificado
import express from 'express';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js'; // Solo necesitamos authMiddleware
// import { adminMiddleware } from '../../shared/middlewares/adminMiddleware.js'; // No es necesario si solo el admin accede

import { 
    // register, // Eliminada
    // login, // Eliminada
    getProfile, 
    // getAllUsers, // Eliminada
    updateUserProfile,
    updateUserPassword
} from './user.controller.js';

const router = express.Router();

// --- Rutas Públicas ---
// router.post('/register', register); // Eliminada
// router.post('/login', login); // Eliminada

// --- Rutas para Usuarios Autenticados ---
// (Estas rutas ahora solo serán para el Admin logueado)

// router.get('/', authMiddleware, adminMiddleware, getAllUsers); // Eliminada (ya está en auth.routes.js)

// Aplicamos el middleware a todas las rutas de perfil
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateUserProfile);
router.put('/profile/password', updateUserPassword);

export default router;