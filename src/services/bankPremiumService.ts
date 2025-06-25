import BankPremium, { IBankPremium } from '../models/bankPremium.model';
import mongoose from 'mongoose';

const createBankPremium = async (
  userId: string,
  data: Partial<IBankPremium>
): Promise<IBankPremium> => {
  const newBankPremium = new BankPremium({
    ...data,
    enrolled_users: [], // initialize enrolled_users
    brand: data.brand || null, // handle optional brand
  });

  return await newBankPremium.save();
};

const getBankPremiumById = async (
  bankPremiumId: string
): Promise<IBankPremium> => {
  const bankPremium = await BankPremium.findById(bankPremiumId).populate('enrolled_users');
  if (!bankPremium) throw new Error('BankPremium not found');
  return bankPremium;
};

const updateBankPremium = async (
  bankPremiumId: string,
  updates: Partial<IBankPremium>
): Promise<IBankPremium> => {
  const existingBankPremium = await BankPremium.findById(bankPremiumId);
  if (!existingBankPremium) throw new Error('BankPremium not found');

  Object.keys(updates).forEach((key) => {
    if (
      key !== 'enrolled_users' &&
      updates[key as keyof IBankPremium] !== undefined
    ) {
      existingBankPremium.set(key, updates[key as keyof IBankPremium]);
    }
  });

  return await existingBankPremium.save();
};

const deleteBankPremium = async (
  bankPremiumId: string
): Promise<IBankPremium> => {
  const bankPremium = await BankPremium.findByIdAndDelete(bankPremiumId);
  if (!bankPremium) throw new Error('BankPremium not found');
  return bankPremium;
};

export const getAllBankPremiums = async (): Promise<IBankPremium[]> => {
  try {
    return await BankPremium.find().populate('enrolled_users');
  } catch (error) {
    console.error('Error fetching BankPremiums from the database:', error);
    throw new Error('Error fetching BankPremiums');
  }
};

export default {
  createBankPremium,
  updateBankPremium,
  deleteBankPremium,
  getBankPremiumById,
  getAllBankPremiums,
};
