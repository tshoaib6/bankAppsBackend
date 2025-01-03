import QRCode from '../models/QRCode.model'
import { IQRCode } from '../models/QRCode.model'

export const createQRCode = async (data: any): Promise<IQRCode> => {
  try {
    const { code, points, isUsed, createdBy } = data

    if (!code || typeof points !== 'number' || typeof isUsed !== 'boolean') {
      throw new Error(
        'Invalid input. Ensure "code" is a string, "points" is a number, and "isUsed" is a boolean.'
      )
    }

    const qrCode = new QRCode({ code, points, isUsed, createdBy })
    await qrCode.save()

    return qrCode
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error creating QR code'
    )
  }
}

export const getAllQRCodes = async (): Promise<IQRCode[]> => {
  try {
    return await QRCode.find()
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching QR codes'
    )
  }
}

export const getQRCodeById = async (
  qrCodeId: string
): Promise<IQRCode | null> => {
  try {
    return await QRCode.findById(qrCodeId)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error fetching QR code'
    )
  }
}

export const updateQRCode = async (
  qrCodeId: string,
  data: any
): Promise<IQRCode | null> => {
  try {
    return await QRCode.findByIdAndUpdate(qrCodeId, data, { new: true })
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error updating QR code'
    )
  }
}

export const deleteQRCode = async (qrCodeId: string): Promise<void> => {
  try {
    await QRCode.findByIdAndDelete(qrCodeId)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Error deleting QR code'
    )
  }
}
