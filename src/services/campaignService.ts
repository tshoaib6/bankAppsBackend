import Campaign, { ICampaign } from '../models/campaign.model';

// Create a new campaign
const createCampaign = async (userId: string, data: Partial<ICampaign>) => {
  const newCampaign = new Campaign({ ...data, enrolled_users: [userId] });
  return await newCampaign.save();
};

// Get a campaign by its ID
const getCampaignById = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  return campaign;
};

// Update an existing campaign
const updateCampaign = async (campaignId: string, updates: Partial<ICampaign>, userId: string) => {
  const existingCampaign = await Campaign.findById(campaignId);
  if (!existingCampaign) throw new Error('Campaign not found');
  
  // Check if the logged-in user is the creator of the campaign
  if (existingCampaign.enrolled_users[0].toString() !== userId) {
    throw new Error('You are not authorized to update this campaign');
  }

  const updatedCampaign = await Campaign.findByIdAndUpdate(campaignId, updates, { new: true });
  return updatedCampaign;
};

// Delete a campaign
const deleteCampaign = async (campaignId: string) => {
  const campaign = await Campaign.findByIdAndDelete(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  return campaign;
};

export const getAllCampaigns = async (): Promise<any> => {
  try {
    return await Campaign.find(); // Assuming you are using Mongoose
  } catch (error) {
    console.error('Error fetching campaigns from the database:', error);
    throw new Error('Error fetching campaigns');
  }
};


export default {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignById,
  getAllCampaigns
};
