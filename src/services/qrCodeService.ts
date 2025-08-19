import QRCode from "../models/QRCode.model";
import { IQRCode } from "../models/QRCode.model";

export const createQRCode = async (data: any): Promise<IQRCode> => {
  try {
    const { code, points, isUsed, createdBy, brand } = data;

    if (!code || typeof points !== "number" || typeof isUsed !== "boolean") {
      throw new Error(
        'Invalid input. Ensure "code" is a string, "points" is a number, and "isUsed" is a boolean.'
      );
    }

    if (!brand) {
      throw new Error("Brand is required when creating a QR code.");
    }

    const qrCode = new QRCode({ code, points, isUsed, createdBy, brand });
    await qrCode.save();

    return qrCode;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error creating QR code"
    );
  }
};

export const getAllQRCodes = async (): Promise<{
  qrCodes: IQRCode[];
  totalCount: number;
  usedCount: number;
  unusedCount: number;
}> => {
  try {
    const qrCodes = await QRCode.find().populate("brand").populate("createdBy");

    const stats = await QRCode.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          usedCount: { $sum: { $cond: ["$isUsed", 1, 0] } },
          unusedCount: { $sum: { $cond: ["$isUsed", 0, 1] } },
        },
      },
    ]);

    const { totalCount, usedCount, unusedCount } = stats[0] || {
      totalCount: 0,
      usedCount: 0,
      unusedCount: 0,
    };

    return {
      qrCodes,
      totalCount,
      usedCount,
      unusedCount,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error fetching QR codes"
    );
  }
};

export const getQRCodeById = async (
  qrCodeId: string
): Promise<IQRCode | null> => {
  try {
    return await QRCode.findById(qrCodeId)
      .populate("brand")
      .populate("createdBy");
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error fetching QR code"
    );
  }
};
export const updateQRCode = async (
  qrCodeId: string,
  data: any
): Promise<IQRCode | null> => {
  try {
    return await QRCode.findByIdAndUpdate(qrCodeId, data, { new: true });
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error updating QR code"
    );
  }
};

export const deleteQRCode = async (qrCodeId: string): Promise<void> => {
  try {
    await QRCode.findByIdAndDelete(qrCodeId);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error deleting QR code"
    );
  }
};
export const getQRCodesByBrandId = async (
  brandId: string
): Promise<IQRCode[]> => {
  try {
    return await QRCode.find({ brand: brandId })
      .populate("brand")
      .populate("createdBy");
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error fetching QR codes by brand"
    );
  }
};

/**
 * Bulk insert QR Codes (optimized for CSV import with millions of records)
 */
export const bulkInsertQRCodes = async (
  qrCodeData: any[]
): Promise<{ insertedCount: number; errors: any[] }> => {
  try {
    if (!Array.isArray(qrCodeData) || qrCodeData.length === 0) {
      throw new Error("QR Code data must be a non-empty array.");
    }

    // Validate structure minimally before inserting
    const validQRCodes = qrCodeData.map((item) => ({
      code: item.code,
      points: Number(item.points) || 0,
      isUsed: Boolean(item.isUsed),
      createdBy: item.createdBy,
      brand: item.brand,
    }));

    // Insert in chunks (to avoid memory issues with millions of records)
    const CHUNK_SIZE = 10000; // Adjust depending on your system
    let insertedCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < validQRCodes.length; i += CHUNK_SIZE) {
      const chunk = validQRCodes.slice(i, i + CHUNK_SIZE);
      try {
        const result = await QRCode.insertMany(chunk, { ordered: false });
        insertedCount += result.length;
      } catch (err: any) {
        errors.push(err);
      }
    }

    return { insertedCount, errors };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error bulk inserting QR codes"
    );
  }
};
