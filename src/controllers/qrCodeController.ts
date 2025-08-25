import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as QRCodeService from "../services/qrCodeService";
import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";

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

    const { code, points, isUsed, brand } = req.body;

    if (
      !code ||
      typeof points !== "number" ||
      typeof isUsed !== "boolean" ||
      !brand
    ) {
      return res.status(400).json({
        message:
          'Invalid input. Ensure "code" is a string, "points" is a number, "isUsed" is a boolean, and "brand" is provided.',
      });
    }

    const qrCodeData = { code, points, isUsed, createdBy: userId, brand };
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

export const getAllQRCodes = async (
  _req: Request,
  res: Response
): Promise<any> => {
  try {
    const { qrCodes, totalCount, usedCount, unusedCount } =
      await QRCodeService.getAllQRCodes();

    return res.status(200).json({
      qrCodes,
      totalCount,
      usedCount,
      unusedCount,
      message: "QR Codes fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching QR codes. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

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
    const userId = decoded.userId;

    const { qrCodeId } = req.params;
    const { code, points, isUsed, brand } = req.body;

    if (
      !code ||
      typeof points !== "number" ||
      typeof isUsed !== "boolean" ||
      !brand
    ) {
      return res.status(400).json({
        message:
          'Invalid input. Ensure "code" is a string, "points" is a number, "isUsed" is a boolean, and "brand" is provided.',
      });
    }

    const qrCode = await QRCodeService.getQRCodeById(qrCodeId);
    if (!qrCode) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    // ✅ Type-safe handling of ObjectId vs populated object
    let createdById: string;
    if (mongoose.isValidObjectId(qrCode.createdBy)) {
      createdById = qrCode.createdBy.toString();
    } else {
      // @ts-ignore if necessary OR define interface for populated user
      createdById = qrCode.createdBy._id?.toString();
    }

    if (createdById !== userId) {
      console.log("Unauthorized update attempt:", {
        qrCodeCreatedBy: createdById,
        userId,
      });

      return res.status(403).json({
        message: "You are not authorized to update this QR Code.",
      });
    }

    const updatedQRCode = await QRCodeService.updateQRCode(qrCodeId, {
      code,
      points,
      isUsed,
      brand,
    });

    return res.status(200).json({
      message: "QR Code updated successfully",
      updatedQRCode,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating QR code. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

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
    const userId = decoded.userId;

    const { qrCodeId } = req.params;
    const qrCode = await QRCodeService.getQRCodeById(qrCodeId);

    if (!qrCode) {
      return res.status(404).json({ message: "QR Code not found" });
    }

    // if (qrCode.createdBy.toString() !== userId) {
    //   return res.status(403).json({
    //     message: 'You are not authorized to delete this QR Code.'
    //   });
    // }

    await QRCodeService.deleteQRCode(qrCodeId);

    return res.status(200).json({ message: "QR Code deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting QR code. Please try again later.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

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

    return res.status(200).json({
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
      .pipe(csv({ trim: true } as any)) // TypeScript-safe cast
      .on("data", (row) => {
        // Only push rows with required fields
        if (row.code && row.brand) {
          qrCodeData.push({
            code: row.code.trim(),
            points: Number(row.points) || 0,
            isUsed: row.isUsed === "true" || row.isUsed === true,
            createdBy: userId,
            brand: row.brand.trim(),
          });
        }
      })
      .on("end", async () => {
        console.log("QR Code data read from CSV:", qrCodeData); // debug log

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
        console.error("Error reading CSV:", err);
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
