import QRCode, { IQRCode } from "../models/QRCode.model";
import { paginate } from "../utils/pagination";
import { EventEmitter } from "events";

/**
 * Create a new QR Code
 */
export const createQRCode = async (data: any): Promise<IQRCode> => {
  try {
    const { code, codeUrl, points, isUsed, brand } = data;

    if (
      !code ||
      !codeUrl ||
      typeof points !== "number" ||
      typeof isUsed !== "boolean"
    ) {
      throw new Error(
        'Invalid input. Ensure "code" and "codeUrl" are strings, "points" is a number, and "isUsed" is a boolean.'
      );
    }

    if (!brand) {
      throw new Error("Brand is required when creating a QR code.");
    }

    const qrCode = new QRCode({ code, codeUrl, points, isUsed, brand });
    await qrCode.save();

    return qrCode;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error creating QR code"
    );
  }
};


  //   export const getAllQRCodes = async (
  //     page: number,
  //     limit: number,
  //     search?: string
  //   ): Promise<{
  //     qrCodes: IQRCode[];
  //     totalCount: number;
  //     usedCount: number;
  //     unusedCount: number;
  //     totalPages: number;
  //     currentPage: number;
  //   }> => {
  //     try {
  //       // ✅ Helper to escape regex special characters
  //       const escapeRegex = (text: string) =>
  //         text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  //       // Build filter for searching
  //       const filter: any = {};
  //     if (search) {
  //   const safeSearch = escapeRegex(search); // ✅ sanitize input
  //   filter.$or = [
  //     { code: { $regex: safeSearch, $options: "i" } },
  //     { codeUrl: { $regex: safeSearch, $options: "i" } },
  //     { brand: { $regex: safeSearch, $options: "i" } }, // optional if you want to allow brand search
  //   ];
  // }

  //       // Pagination with search filter
  //       const { data: qrCodes, totalCount, totalPages, currentPage } =
  //         await paginate<IQRCode>(QRCode, {
  //           page,
  //           limit,
  //           sort: { createdAt: -1 },
  //           filter,
  //         });

  //       // Stats (for dashboard counts) ✅ apply same filter
  //       const stats = await QRCode.aggregate([
  //         { $match: filter },
  //         {
  //           $group: {
  //             _id: null,
  //             usedCount: { $sum: { $cond: ["$isUsed", 1, 0] } },
  //             unusedCount: { $sum: { $cond: ["$isUsed", 0, 1] } },
  //           },
  //         },
  //       ]);

  //       const { usedCount, unusedCount } = stats[0] || {
  //         usedCount: 0,
  //         unusedCount: 0,
  //       };

  //       return {
  //         qrCodes,
  //         totalCount,
  //         usedCount,
  //         unusedCount,
  //         totalPages,
  //         currentPage,
  //       };
  //     } catch (error) {
  //       throw new Error(
  //         error instanceof Error ? error.message : "Error fetching QR codes"
  //       );
  //     }
  //   };





export const getAllQRCodes = async (
  page: number,
  limit: number,
  search?: string
): Promise<{
  qrCodes: any[];
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const escapeRegex = (text: string) =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filter: any = {};
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { code: { $regex: safeSearch, $options: "i" } },
        { codeUrl: { $regex: safeSearch, $options: "i" } },
        { brand: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // ✅ Use paginate utility
    const paginatedResult = await paginate(QRCode, {
      page,
      limit,
      sort: { createdAt: -1 },
      filter,
    });

    return {
      qrCodes: paginatedResult.data,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error fetching QR codes"
    );
  }
};



/**
 * Get a single QR Code by ID
 */
export const getQRCodeById = async (
  qrCodeId: string
): Promise<IQRCode | null> => {
  try {
    return await QRCode.findById(qrCodeId);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error fetching QR code"
    );
  }
};
  
/**
 * Update a QR Code
 */
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

/**
 * Delete a QR Code
 */
export const deleteQRCode = async (qrCodeId: string): Promise<void> => {
  try {
    await QRCode.findByIdAndDelete(qrCodeId);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Error deleting QR code"
    );
  }
};

/**
 * Get all QR Codes for a specific brand (brand is now a string)
 */
export const getQRCodesByBrandId = async (
  brandId: string
): Promise<IQRCode[]> => {
  try {
    return await QRCode.find({ brand: brandId });
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
      claimedAt: item.claimedAt,
      claimedBy: item.claimedBy,
      codeUrl: item.codeUrl,
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



/**
 * Get QR code usage stats per user with user details
 */
export const getQRCodeUsageByUsers = async (): Promise<any[]> => {
  try {
    const result = await QRCode.aggregate([
      {
        $match: { isUsed: true, claimedBy: { $ne: null } }, // only used codes
      },
      {
        $group: {
          _id: "$claimedBy", // group by userId
          usedCount: { $sum: 1 }, // count used codes
        },
      },
      {
        $lookup: {
          from: "users", // collection name in MongoDB
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" }, // flatten array
      {
        $project: {
          _id: 0,
          userId: "$_id",
          usedCount: 1,
          username: "$user.username",
          parish: "$user.parish",
          email: "$user.email",
          dateOfBirth: "$user.dateOfBirth",
        },
      },
    ]);

    return result;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error fetching QR code usage by users"
    );
  }
};



/**
 * Optimized bulk insert for QR Codes (structure matched with old function).
 * Skips existing QR codes safely and reports progress if EventEmitter provided.
 */
export const bulkInsertQRCodesSkipExisting = async (
  qrCodeData: any[],
  progressEmitter?: EventEmitter
): Promise<{ insertedCount: number; skippedCount: number; errors: any[] }> => {
  try {
    if (!Array.isArray(qrCodeData) || qrCodeData.length === 0) {
      throw new Error("QR Code data must be a non-empty array.");
    }


    const CHUNK_SIZE = 5000; // Adjust as per memory & performance
    let insertedCount = 0;
    let skippedCount = 0;
    const errors: any[] = [];

    // ✅ Safe index creation (won’t break if duplicates exist)
    try {
      await QRCode.collection.createIndex({ code: 1 }, { unique: true });
    } catch (indexErr: any) {
    }

    // ✅ Match old structure for QRCode documents
    for (let i = 0; i < qrCodeData.length; i += CHUNK_SIZE) {
      const chunk = qrCodeData.slice(i, i + CHUNK_SIZE);

      const docs = chunk.map((item) => ({
        code: item.code,
        points: Number(item.points) || 0,
        isUsed: Boolean(item.isUsed),
        claimedAt: item.claimedAt,
        claimedBy: item.claimedBy,
        codeUrl: item.codeUrl,
        brand: item.brand,
      }));

      // Use upsert (insert only if code doesn’t exist)
      const operations = docs.map((doc) => ({
        updateOne: {
          filter: { code: doc.code },
          update: { $setOnInsert: doc },
          upsert: true,
        },
      }));

      try {
        const result = await QRCode.bulkWrite(operations, { ordered: false });
        const batchInserted = result.upsertedCount || 0;

        insertedCount += batchInserted;
        skippedCount += chunk.length - batchInserted;

        // Calculate progress percentage
        const percent = Math.min(
          Math.round(((i + CHUNK_SIZE) / qrCodeData.length) * 100),
          100
        );



        // 🔹 Emit progress if listener provided
        if (progressEmitter) {
          progressEmitter.emit("progress", {
            percent,
            insertedCount,
            skippedCount,
            total: qrCodeData.length,
            done: percent === 100,
          });
        }
      } catch (err: any) {
        const dupErrors =
          err?.writeErrors?.filter((e: any) => e.code === 11000)?.length || 0;
        skippedCount += dupErrors;
        errors.push(err);
      
      }
    }


    // Final event emit for completion
    if (progressEmitter) {
      progressEmitter.emit("progress", {
        percent: 100,
        insertedCount,
        skippedCount,
        total: qrCodeData.length,
        done: true,
      });
    }

    return { insertedCount, skippedCount, errors };
  } catch (error: any) {
    throw new Error(
      error.message || "Error during optimized QR code insertion"
    );
  }
};
