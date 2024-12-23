import Campaign, { ICampaign } from '../models/campaign.model';

const createCampaign = async (userId: string, data: Partial<ICampaign>) => {
  const newCampaign = new Campaign({ ...data, enrolled_users: [userId] });
  return await newCampaign.save();
};

const updateCampaign = async (campaignId: string, updates: Partial<ICampaign>) => {
  const updatedCampaign = await Campaign.findByIdAndUpdate(campaignId, updates, { new: true });
  if (!updatedCampaign) throw new Error('Campaign not found');
  return updatedCampaign;
};

const deleteCampaign = async (campaignId: string) => {
  const campaign = await Campaign.findByIdAndDelete(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  return campaign;
};

export default {
  createCampaign,
  updateCampaign,
  deleteCampaign,
};
