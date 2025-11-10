import profileModel from '../models/ProfileModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone, preferedCourse } = req.body;

    // Find existing profile
    const profile = await profileModel.findOne({ userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    // Handle image update if a new file is uploaded
    if (req.file) {
      const localImagePath = req.file.path;

      // Delete old image from Cloudinary if it exists
      if (profile.publicId) {
        try {
          await cloudinary.uploader.destroy(profile.publicId);
          console.log('Old image deleted from Cloudinary:', profile.publicId);
        } catch (err) {
          console.error('Error deleting old image:', err.message);
        }
      }

      // Upload new image to Cloudinary
      const uploadedImage = await uploadOnCloudinary(localImagePath, 'user_profiles');
      if (!uploadedImage) {
        return res.status(500).json({ success: false, message: 'Image upload failed' });
      }

      // Update profile image details
      profile.profileImage = uploadedImage.secure_url;
      profile.publicId = uploadedImage.public_id;

      // Delete local file safely
      try {
        if (fs.existsSync(localImagePath)) {
          fs.unlinkSync(localImagePath);
        }
      } catch (err) {
        console.error('Error deleting local file:', err.message);
      }
    }

    // Update other fields if provided
    if (phone) profile.phone = phone;
    if (preferedCourse) profile.preferedCourse = preferedCourse;

    // Save updated profile
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};
