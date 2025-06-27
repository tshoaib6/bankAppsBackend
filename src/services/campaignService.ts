import Campaign, { ICampaign } from '../models/campaign.model'

// 🚀 Create campaign (now accepts brandId)
const createCampaign = async (
  userId: string,
  data: Partial<ICampaign> & { brand?: string } // brand is optional for backward compatibility
) => {
  const newCampaign = new Campaign({
    ...data,
    enrolled_users: [],
    brand: data.brand || undefined, // 👈 Safely include brand if provided
  })
  return await newCampaign.save()
}

// 🔍 Get a single campaign
const getCampaignById = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId).populate('brand') // 👈 include brand info
  if (!campaign) throw new Error('Campaign not found')
  return campaign
}

// ✏️ Update campaign (unchanged logic, preserved old user-based check)
const updateCampaign = async (
  campaignId: string,
  updates: Partial<ICampaign>,
  userId: string
) => {
  const existingCampaign = await Campaign.findById(campaignId)
  if (!existingCampaign) throw new Error('Campaign not found')

  if (existingCampaign.enrolled_users[0]?.toString() !== userId) {
    throw new Error('You are not authorized to update this campaign')
  }

  const updatedCampaign = await Campaign.findByIdAndUpdate(
    campaignId,
    updates,
    { new: true }
  )
  return updatedCampaign
}

// 🗑️ Delete campaign
const deleteCampaign = async (campaignId: string) => {
  const campaign = await Campaign.findByIdAndDelete(campaignId)
  if (!campaign) throw new Error('Campaign not found')
  return campaign
}

// 📥 Get all campaigns (optional brand filter)
export const getAllCampaigns = async (
  brandId?: string
): Promise<ICampaign[]> => {
  try {
    const filter = brandId ? { brand: brandId } : {}
    return await Campaign.find(filter).populate('brand') // 👈 include brand if requested
  } catch (error) {
    console.error('Error fetching campaigns from the database:', error)
    throw new Error('Error fetching campaigns')
  }
}


// 🔍 Get all campaigns by a specific brand ID
const getCampaignsByBrandId = async (brandId: string): Promise<ICampaign[]> => {
  try {
    const campaigns = await Campaign.find({ brand: brandId }).populate('brand');
    return campaigns;
  } catch (error) {
    console.error(`Error fetching campaigns for brand ${brandId}:`, error);
    throw new Error('Failed to fetch campaigns by brand ID');
  }
};


export default {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignById,
  getAllCampaigns,
  getCampaignsByBrandId
}
