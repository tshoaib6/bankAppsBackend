import { Router } from 'express';
import { register, login, getUsers, updateUserStatus, deleteUser, verifyEmail } from '../controllers/userController'; 

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.get('/getAllUsers', getUsers);

router.put('/user/:userId/status', updateUserStatus);

router.delete('/user/:userId', deleteUser);

router.get('/verify-email/:token', verifyEmail);

export default router;
