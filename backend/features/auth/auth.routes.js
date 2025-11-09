// backend/routes/auth.js
import express from 'express'
import { loginUsuario, obtenerTodosLosUsuarios } from '../controllers/authController.js';
import authMiddleware, { adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUsuario)

router.get('/usuarios', authMiddleware, adminMiddleware, obtenerTodosLosUsuarios);

export default router;