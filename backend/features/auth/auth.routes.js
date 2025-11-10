//revisado
// backend/routes/auth.js 
import express from 'express'
import { loginUsuario, obtenerTodosLosUsuarios } from './auth.controller.js';
import { authMiddleware,  adminMiddleware } from '../../shared/middlewares/auth.middleware.js'; 

const router = express.Router();

router.post('/login', loginUsuario)

router.get('/usuarios', authMiddleware, adminMiddleware, obtenerTodosLosUsuarios);

export default router;