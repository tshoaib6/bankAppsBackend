import { Router } from 'express';
import { getUserHistory } from '../controllers/userHistory'; // Import the controller

const router = Router();

// Route to get the user history
router.get('/Userhistory', getUserHistory);

export default router;
