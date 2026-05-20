import express from 'express';
import { signupAdmin, loginAdmin, logoutAdmin } from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signupAdmin);
router.post('/login', loginAdmin);
router.post('/logout', protectAdmin, logoutAdmin);

export default router;
