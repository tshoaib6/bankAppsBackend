import { Router } from 'express';
import { register, login, getUsers, updateUserStatus, deleteUser, verifyEmail } from '../controllers/userController'; 

const router = Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get all users route
router.get('/getAllUsers', getUsers);

// Update user status route (Block/Unblock user)
router.put('/user/:userId/status', updateUserStatus);

// Route to delete user
router.delete('/user/:userId', deleteUser);

// Route to verify user email
router.get('/verify-email/:token', verifyEmail);

export default router;
