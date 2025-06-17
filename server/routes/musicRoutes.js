// routes/musicRoutes.js
import express from 'express';
import {
  getTrendingMusic,
  getMusicById,
  searchMusic,
} from '../controllers/musicController.js';

const router = express.Router();

// Routes
router.get('/trending', getTrendingMusic); // Get trending music
router.get('/:id', getMusicById);         // Get a single track by ID
router.get('/search', searchMusic);       // Search for music

export default router;
