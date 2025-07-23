import express from 'express';
import { register, login, logout, getAllUsers } from '../controllers/userController.js';
import verifyToken from '../middlewares/verifyToken.js';
import { isAuthenticated, isSuperAdminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only superadmin can register new managers/admins
router.post('/register', verifyToken, isSuperAdminOnly, register);

// Admin/manager login
router.post('/login', login);

// Logout (optional – client-side JWT removal)
router.get('/logout', verifyToken, isAuthenticated, logout);

router.get('/all', verifyToken, isSuperAdminOnly, getAllUsers);

export default router;
