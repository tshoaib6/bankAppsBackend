import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import fs from 'fs'; // Import fs module to read files if necessary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Accepts either a buffer or a file path
export const uploadToCloudinary = async (fileInput: Buffer | string, folder: string): Promise<string> => {
  try {
    // Check if the input is a file path, and read it as a buffer
    const fileBuffer = typeof fileInput === 'string' ? fs.readFileSync(fileInput) : fileInput;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);  // Reject with the error
          } else {
            // Check if result is defined before accessing its properties
            if (result) {
              console.log('Cloudinary upload result:', result); // Log the result for debugging
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
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Error uploading image to Cloudinary');
  }
};
