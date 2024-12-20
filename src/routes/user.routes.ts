import { Router } from 'express';
import { register, login, getUsers, updateUserStatus, deleteUser} from '../controllers/userController'; 

const router = Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

router.get('/getAllUsers', getUsers);

router.put('/user/:userId/status', updateUserStatus);

// Route to delete user
router.delete('/user/:userId', deleteUser);
export default router;
