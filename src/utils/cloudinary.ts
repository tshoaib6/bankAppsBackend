import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import fs from 'fs'; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileInput: Buffer | string, folder: string): Promise<string> => {
  try {
    const fileBuffer = typeof fileInput === 'string' ? fs.readFileSync(fileInput) : fileInput;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            reject(error); 
          } else {
            if (result) {
              resolve(result.secure_url || '');
            } else {
              reject(new Error('No result returned from Cloudinary'));
            }
          }
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  } catch (error) {
    throw new Error('Error uploading image to Cloudinary');
  }
};
