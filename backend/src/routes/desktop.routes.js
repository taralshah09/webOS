import express from 'express';
import { 
  getDesktop, 
  updateDesktopIcons, 
  updateIconPosition,
  updateWallpaper
} from '../controllers/desktop.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateJWT);

// Get desktop configuration
router.get('/', getDesktop);

// Update all desktop icons
router.put('/icons', updateDesktopIcons);

// Update single icon position (for real-time updates)
router.put('/icon-position', updateIconPosition);

// Update wallpaper
router.put('/wallpaper', updateWallpaper);

export default router;