import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folder = 'general_uploads') => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto', // auto detects image/pdf/video/etc.
      folder, // upload to the specified folder
    });

    console.log(` File uploaded to Cloudinary (${folder}):`, response.url);

    // Delete local file after upload
    fs.unlinkSync(localFilePath);

    return {
      url: response.url,
      public_id: response.public_id,
      resource_type: response.resource_type,
    };
  } catch (error) {
    console.log(' Error uploading to Cloudinary:', error);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId, resourceType) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    console.log(' File deleted from Cloudinary', result);
  } catch (error) {
    console.log(' Error deleting file from Cloudinary', error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
