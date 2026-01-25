import express from 'express';
import { getHomeConfig, updateHomeConfig } from './config.controller.js';
import { authMiddleware as protect, adminMiddleware as admin } from '../../shared/middlewares/auth.middleware.js';

const router = express.Router();

router.get('/home', getHomeConfig);
router.put('/home', protect, admin, updateHomeConfig);

export default router;
