import { Router } from 'express';
import { generateVideo, uploadAssets } from '../controllers/videoController.js';

const router = Router();

// This route now uses the 'uploadAssets' controller
router.post('/upload', uploadAssets); 
router.post('/generate-video', generateVideo);

export default router;