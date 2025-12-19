import express from 'express';
import { getSettings, updateSettings } from './settings.controller.js';
import { authMiddleware, adminMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();

// GET público: Para que la tienda sepa si mostrarse abierta y calcular fechas
router.get('/', getSettings);

// PUT privado: Solo admin cambia reglas
router.put('/', authMiddleware, adminMiddleware, updateSettings);

export default router;
