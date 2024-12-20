import { Router } from 'express';
import { register, login, getUsers } from '../controllers/userController'; 

const router = Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

router.get('/getAllUsers', getUsers);


export default router;
