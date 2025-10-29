import latestNewModel from '../models/latestNewsModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

// CREATE
export const createImageContent = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const uploadedImage = await uploadOnCloudinary(req.file.path);
    if (!uploadedImage) {
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }

    const newImageContent = new latestNewModel({
      image: uploadedImage.url,
      publicId: uploadedImage.public_id || '',
      clientId: req.user._id,
      title,
      description,
    });

    const savedData = await newImageContent.save();

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: savedData,
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating content',
      error: error.message,
    });
  }
};

//  GET ALL
export const getAllImageContents = async (req, res) => {
  try {
    const contents = await latestNewModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contents.length,
      data: contents,
    });
  } catch (error) {
    console.error('Error fetching contents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contents',
      error: error.message,
    });
  }
};

//  GET BY ID
export const getImageContentById = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await latestNewModel.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error fetching content by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching content',
      error: error.message,
    });
  }
};

// UPDATE
export const updateImageContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const existing = await latestNewModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    let imageUrl = existing.image;
    let publicId = existing.publicId;

    // If new image uploaded
    if (req.file) {
      try {
        // Delete old image
        if (existing.publicId) {
          await cloudinary.uploader.destroy(existing.publicId);
        }
        const uploaded = await uploadOnCloudinary(req.file.path);
        imageUrl = uploaded.url;
        publicId = uploaded.public_id;
      } catch (err) {
        console.error('Error replacing image:', err);
      }
    }

    const updated = await latestNewModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        image: imageUrl,
        publicId,
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: 'Content updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating content',
      error: error.message,
    });
  }
};

//  DELETE
export const deleteImageContent = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await latestNewModel.findById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Delete from Cloudinary
    if (existing.publicId) {
      try {
        await cloudinary.uploader.destroy(existing.publicId);
      } catch (err) {
        console.error('Error deleting Cloudinary image:', err);
      }
    }

    await latestNewModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting content',
      error: error.message,
    });
  }
};
