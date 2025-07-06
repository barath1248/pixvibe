import express from 'express';
import { getyoutubevideos, trackVideoView }  from '../controllers/watchController.js';

const router= express.Router();

router.get("/", getyoutubevideos);
router.post("/track-view", trackVideoView);

export default router;