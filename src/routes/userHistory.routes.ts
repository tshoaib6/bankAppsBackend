import { Router } from 'express';
import { getUserHistory, getUserHistoryById } from '../controllers/userHistory'; // Import the controller

const router = Router();

// Route to get the user history
router.get('/Userhistory', getUserHistory);

router.get('/userHistoryByUserId/:userId', getUserHistoryById);

export default router;
