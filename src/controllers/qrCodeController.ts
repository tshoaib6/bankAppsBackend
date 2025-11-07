import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as QRCodeService from "../services/qrCodeService";
import fs from "fs";
import csv from "csv-parser";
import { EventEmitter } from "events";
export const progressEmitter = new EventEmitter();

// ✅ Create QR Code
export const createQRCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { code, codeUrl, points, isUsed, brand } = req.body;

    if (
      !code ||
      !codeUrl ||
      typeof points !== "number" ||
      typeof isUsed !== "boolean" ||
      !brand
    ) {
      return res.status(400).json({
        message:
          'Invalid input. Ensure "code" and "codeUrl" are strings, "points" is a number, "isUsed" is a boolean, and "brand" is provided.',
      });
    }

    // ✅ match service: codeUrl is required
    const qrCodeData = {
      code,
      codeUrl,
      points,
      isUsed,
      createdBy: userId,
      brand,
    };
    const qrCode = await QRCodeService.createQRCode(qrCodeData);

    return res
      .status(201)
      .json({ message: "QR Code created successfully", qrCode });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while creating QR code. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const getAllQRCodesController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";

    // ✅ Call the service function
    const { qrCodes, totalCount, totalPages, currentPage } =
      await QRCodeService.getAllQRCodes(page, limit, search);

    return res.status(200).json({
      qrCodes,
      totalCount,
      totalPages,
      currentPage,
      message: "QR Codes fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching QR codes. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


// ✅ Get QR Code by ID
export const getQRCodeById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { qrCodeId } = req.params;
    const qrCode = await QRCodeService.getQRCodeById(qrCodeId);

    if (!qrCode) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    return res
      .status(200)
      .json({ qrCode, message: "QR Code fetched successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching QR code. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ✅ Update QR Code (only admins allowed)
export const updateQRCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (decoded.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admins are authorized to update QR Codes.",
      });
    }

    const { qrCodeId } = req.params;
    const { code, codeUrl, points, isUsed, brand } = req.body;

    if (
      !code ||
      !codeUrl ||
      typeof points !== "number" ||
      typeof isUsed !== "boolean" ||
      !brand
    ) {
      return res.status(400).json({
        message:
          'Invalid input. Ensure "code" and "codeUrl" are strings, "points" is a number, "isUsed" is a boolean, and "brand" is provided.',
      });
    }

    const qrCode = await QRCodeService.getQRCodeById(qrCodeId);
    if (!qrCode) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    // ✅ now also updates codeUrl (since service expects it)
    const updatedQRCode = await QRCodeService.updateQRCode(qrCodeId, {
      code,
      codeUrl,
      points,
      isUsed,
      brand,
    });

    return res
      .status(200)
      .json({ message: "QR Code updated successfully", updatedQRCode });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating QR code. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ✅ Delete QR Code (admins only)
export const deleteQRCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (decoded.userRole !== "admin") {
      return res.status(403).json({
        message: "Only admins are authorized to delete QR Codes.",
      });
    }

    const { qrCodeId } = req.params;
    const qrCode = await QRCodeService.getQRCodeById(qrCodeId);

    if (!qrCode) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    await QRCodeService.deleteQRCode(qrCodeId);

    return res.status(200).json({ message: "QR Code deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting QR code. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ✅ Get QR Codes by Brand (brand is string now)
export const getQRCodesByBrandId = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { brandId } = req.params;

    if (!brandId) {
      return res.status(400).json({ message: "Brand ID is required" });
    }

    const qrCodes = await QRCodeService.getQRCodesByBrandId(brandId);

    if (!qrCodes || qrCodes.length === 0) {
      return res
        .status(404)
        .json({ message: "No QR Codes found for this brand" });
    }

    return res
      .status(200)
      .json({
        qrCodes,
        message: "QR Codes fetched successfully for the brand",
      });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching QR codes by brand",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ✅ Bulk Upload QR Codes (CSV import)
export const bulkUploadQRCodes = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const qrCodeData: any[] = [];

    fs.createReadStream(req.file.path)
      .pipe(csv({ trim: true } as any))
      .on("data", (row) => {
        const extractedCode = row.url.split("/").pop()?.trim() || "";

        if (row.url) {
          qrCodeData.push({
            code: extractedCode,
            codeUrl: row.url, // ✅ must include codeUrl
            points: Number(row.points) || 20, // ✅ allow CSV to set points
            isUsed: false,
            claimedAt: null,
            claimedBy: null,
            brand: row.brand || "Banks", // ✅ use row.brand if present
          });
        }
      })
      .on("end", async () => {
        if (qrCodeData.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid QR codes found in CSV" });
        }

        const result = await QRCodeService.bulkInsertQRCodes(qrCodeData);

        return res.status(201).json({
          message: `${result.insertedCount} QR codes inserted successfully`,
          errors: result.errors.length,
        });
      })
      .on("error", (err) => {
        return res
          .status(500)
          .json({ message: "Error reading CSV file", error: err });
      });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while uploading QR codes. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getQRCodeUsageByUsersController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await QRCodeService.getQRCodeUsageByUsers();
    return res.status(200).json({
      success: true,
      message: "QR code usage stats fetched successfully",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching QR code usage stats",
    });
  }
};

// const progressEmitter = new EventEmitter();

// ✅ SSE endpoint to send progress live
export const qrUploadProgressStream = (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const onProgress = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  progressEmitter.on("progress", onProgress);

  req.on("close", () => {
    progressEmitter.off("progress", onProgress);
  });
};

// ✅ Main upload endpoint
// export const bulkUploadQRCodesOptimized = async (req: Request, res: Response): Promise<any> => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "CSV file is required" });
//     }

//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ message: "Authorization token required" });
//     }

//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//     const userId = decoded.userId;

//     const qrCodeData: any[] = [];

//     fs.createReadStream(req.file.path)
//       .pipe(csv({ trim: true } as any))
//       .on("data", (row) => {
//         const extractedCode = row.url.split("/").pop()?.trim() || "";

//         if (row.url) {
//           qrCodeData.push({
//             code: extractedCode,
//             codeUrl: row.url,
//             points: Number(row.points) || 20,
//             isUsed: false,
//             claimedAt: null,
//             claimedBy: null,
//             brand: row.brand || "Banks",
//           });
//         }
//       })
//       .on("end", async () => {
//         if (qrCodeData.length === 0) {
//           return res.status(400).json({ message: "No valid QR codes found in CSV" });
//         }

  //         // ✅ Pass emitter to service
  //         const result = await QRCodeService.bulkInsertQRCodesSkipExisting(qrCodeData, progressEmitter);

//         return res.status(201).json({
//           message: `✅ ${result.insertedCount} new QR codes inserted. ${result.skippedCount} skipped (already existed).`,
//           insertedCount: result.insertedCount,
//           skippedCount: result.skippedCount,
//           errors: result.errors.length,
//         });
//       })
//       .on("error", (err) => {
//         return res.status(500).json({ message: "Error reading CSV file", error: err });
//       });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Server error while uploading QR codes. Please try again later.",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };
export const bulkUploadQRCodesOptimized = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // 🧾 1. File Validation
    if (!req.file) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    // 🔐 2. Token Validation
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // 📦 3. Prepare Data Array
    const qrCodeData: any[] = [];

    // 🟢 Log progress locally (optional for backend logs)
   

    // 🧠 4. Parse CSV File Stream
    fs.createReadStream(req.file.path)
      .pipe(csv({ trim: true } as any))
      .on("data", (row) => {
        // ✅ Only `codeUrl` is expected in CSV
        if (
          row.codeUrl &&
          typeof row.codeUrl === "string" &&
          row.codeUrl.trim().length > 0
        ) {
          const cleanUrl = row.codeUrl.trim();

          // Extract last 6 characters from codeUrl (adjustable)
          const extractedCode =
            cleanUrl.split("/").pop()?.trim().slice(-6) || "";

          if (extractedCode.length === 0) return; // skip if invalid

          qrCodeData.push({
            code: extractedCode, // auto-generated from URL
            codeUrl: cleanUrl, // stored as provided
            points: Number(row.points) || 20,
            isUsed: false, // default false
            claimedAt: null,
            claimedBy: null,
            brand: row.brand?.trim() || "Banks",
          });
        }
      })
      .on("end", async () => {
        // 🚫 Handle empty data
        if (qrCodeData.length === 0) {
          return res
            .status(400)
            .json({ message: "No valid QR codes found in CSV" });
        }

        try {
          // 🚀 5. Bulk Insert & Skip Existing
          const result = await QRCodeService.bulkInsertQRCodesSkipExisting(
            qrCodeData,
            progressEmitter
          );

          // ✅ 6. Send Final Response
          return res.status(201).json({
            message: `✅ ${result.insertedCount} new QR codes inserted. ${result.skippedCount} skipped (already existed).`,
            insertedCount: result.insertedCount,
            skippedCount: result.skippedCount,
            errors: result.errors.length,
          });
        } catch (serviceError: any) {
          console.error("❌ Service error:", serviceError);
          return res.status(500).json({
            message: "Error inserting QR codes.",
            error: serviceError.message,
          });
        }
      })
      .on("error", (err) => {
        // ⚠️ Handle CSV Read Errors
        console.error("❌ CSV Read Error:", err);
        return res
          .status(500)
          .json({ message: "Error reading CSV file", error: err.message });
      });
  } catch (error: any) {
    // 🔴 Global Catch
    console.error("❌ Controller Error:", error);
    return res.status(500).json({
      message: "Server error while uploading QR codes.",
      error: error.message || "Unknown error",
    });
  }
};













// let latestProgress: any = { percent: 0, insertedCount: 0, skippedCount: 0, done: false };

// // 🔹 SSE progress stream endpoint (frontend can subscribe to it)
// export const streamQRCodesUploadProgress = (req: Request, res: Response) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   // Immediately send current progress
//   res.write(`data: ${JSON.stringify(latestProgress)}\n\n`);

//   // Periodically send updates
//   const interval = setInterval(() => {
//     res.write(`data: ${JSON.stringify(latestProgress)}\n\n`);
//   }, 1000);

//   req.on("close", () => {
//     clearInterval(interval);
//   });
// };

// export const bulkUploadQRCodesOptimized = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "CSV file is required" });
//     }

//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res.status(401).json({ message: "Authorization token required" });
//     }

//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//     const userId = decoded.userId;

//     const qrCodeData: any[] = [];
//     const progressEmitter = new EventEmitter();

//     // 🔹 Update latest progress when emitted from service
//     progressEmitter.on("progress", (progress) => {
//       latestProgress = progress; // Keep most recent status for frontend
//    
//     });

//     fs.createReadStream(req.file.path)
//       .pipe(csv({ trim: true } as any))
//       .on("data", (row) => {
//         // ✅ Only `codeUrl` expected in CSV
//         if (row.codeUrl && typeof row.codeUrl === "string" && row.codeUrl.trim().length > 0) {
//           const cleanUrl = row.codeUrl.trim();
//           const extractedCode = cleanUrl.split("/").pop()?.trim().slice(-6) || "";

//           if (extractedCode.length === 0) return; // skip invalid URLs

//           qrCodeData.push({
//             code: extractedCode,
//             codeUrl: cleanUrl,
//             points: Number(row.points) || 20,
//             isUsed: false,
//             claimedAt: null,
//             claimedBy: null,
//             brand: row.brand?.trim() || "Banks",
//           });
//         }
//       })
//       .on("end", async () => {
//         if (qrCodeData.length === 0) {
//           latestProgress = { percent: 100, insertedCount: 0, skippedCount: 0, done: true };
//           return res
//             .status(400)
//             .json({ message: "No valid QR codes found in CSV" });
//         }

//         try {
//           const result = await QRCodeService.bulkInsertQRCodesSkipExisting(
//             qrCodeData,
//             progressEmitter
//           );

//           latestProgress = {
//             percent: 100,
//             insertedCount: result.insertedCount,
//             skippedCount: result.skippedCount,
//             done: true,
//           };

//           return res.status(201).json({
//             message: `✅ ${result.insertedCount} new QR codes inserted. ${result.skippedCount} skipped (already existed).`,
//             insertedCount: result.insertedCount,
//             skippedCount: result.skippedCount,
//             errors: result.errors.length,
//           });
//         } catch (serviceError: any) {
//           latestProgress = { ...latestProgress, done: true };
//           console.error("❌ Service error:", serviceError);
//           return res.status(500).json({
//             message: "Error inserting QR codes.",
//             error: serviceError.message,
//           });
//         }
//       })
//       .on("error", (err) => {
//         latestProgress = { ...latestProgress, done: true };
//         console.error("❌ CSV Read Error:", err);
//         return res
//           .status(500)
//           .json({ message: "Error reading CSV file", error: err.message });
//       });
//   } catch (error: any) {
//     latestProgress = { ...latestProgress, done: true };
//     console.error("❌ Controller Error:", error);
//     return res.status(500).json({
//       message: "Server error while uploading QR codes.",
//       error: error.message || "Unknown error",
//     });
//   }
// };


// router.get("/stream-progress", streamQRCodesUploadProgress);
