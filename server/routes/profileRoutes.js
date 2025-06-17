import express from 'express';
import multer from 'multer';
import { uploadProfile, getProfile } from '../controllers/profileController.js';

const router = express.Router();

// Upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Routes
router.post('/', upload.single('profile_picture'), uploadProfile);
router.get('/:username', getProfile);

export default router;
