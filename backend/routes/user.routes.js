import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';
import { validateToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/get-user-profile', validateToken, getUserProfile);

router.put('/update-user-profile', validateToken, updateUserProfile);

export default router;
