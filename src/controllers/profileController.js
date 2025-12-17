import profileModel from '../models/ProfileModel.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone, preferedCourse } = req.body;
console.log("req.file:", req.file);
console.log("req.body:", req.body);

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
          await deleteFromCloudinary(profile.publicId);
          // await cloudinary.uploader.destroy(profile.publicId);
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
      profile.profileImage = uploadedImage.url;
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

//  Get profile data by userId
export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // e.g., /api/profile/:userId

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Fetch all profiles for the given user ID (usually one, but supports multiple)
    const profiles = await profileModel.find({ userId });

    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ success: false, message: 'No profiles found for this user' });
    }

    res.status(200).json({
      success: true,
      message: 'Profiles fetched successfully',
      data: profiles,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile data',
      error: error.message,
    });
  }
};
