import History from '../models/userHistory.model';

export const logUserActivity = async (
  userId: string,
  description: string,
  type: string,
  pointsEarned: number = 0,
  pointsUsed: number = 0,
  referenceId: string = ''
) => {
  try {
    const historyEntry = new History({
      user_id: userId,
      description,
      type,
      points_earned: pointsEarned,
      points_used: pointsUsed,
      reference_id: referenceId,
    });
    await historyEntry.save();
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
};
