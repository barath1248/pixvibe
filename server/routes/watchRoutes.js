import express from 'express';
import { getyoutubevideos }  from '../controllers/watchController.js';

const router= express.Router();

router.get("/", getyoutubevideos);
export default router;