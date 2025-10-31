import liveBatchModel from '../models/liveBatchesModel.js';
import dotenv from 'dotenv';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';

dotenv.config();

//  Create / Add a new batch in a category
export const addBatchToCategory = async (req, res) => {
  try {
    const { batchCategory, batchName, syllabus, duration, price, teachers, enrollLink } = req.body;

    // Validate image
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    // Upload to Cloudinary
    const uploadedImage = await uploadOnCloudinary(req.file.path, 'Batch_images');
    if (!uploadedImage) {
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }

    //Find or create the category document
    let existingCategory = await liveBatchModel.findOne({ batchCategory: batchCategory });
    if (!existingCategory) {
      existingCategory = new liveBatchModel({ batchCategory: batchCategory, batches: [] });
    }

    //  Push new course inside that category
    existingCategory.batches.push({
      image: uploadedImage.url,
      publicId: uploadedImage.public_id || '',
      batchCategory,
      batchName,
      syllabus,
      duration,
      price,
      teachers,
      enrollLink,
    });

    const saved = await existingCategory.save();

    res.status(201).json({
      success: true,
      message: 'Batch added successfully',
      category: saved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding batch', error: error.message });
  }
};

//Get all categories with batches
export const getAllCategories = async (req, res) => {
  try {
    const categories = await liveBatchModel.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
};

//  Get all batches in one category
export const getBatchesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await liveBatchModel.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    res.status(200).json({ success: true, batches: category.batches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching batches', error: error.message });
  }
};

// Get a Single Batch by Category and Batch ID
export const getSingleBatch = async (req, res) => {
  try {
    const { categoryId, batchId } = req.params;

    const category = await liveBatchModel.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const batch = category.batches.id(batchId);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching batch', error: error.message });
  }
};

// Update a specific batch inside a category
export const updateBatch = async (req, res) => {
  try {
    const { categoryId, batchId } = req.params;
    const category = await liveBatchModel.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const batch = category.batches.id(batchId);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    // Update image if a new one is uploaded
    if (req.file) {
      const imageUrl = await uploadOnCloudinary(req.file.path);
      batch.image = imageUrl;
    }

    const updatableFields = ['batchName', 'syllabus', 'duration', 'price', 'teachers', 'enrollLink'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) batch[field] = req.body[field];
    });

    await category.save();
    res.status(200).json({ success: true, message: 'Batch updated successfully', batch });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating batch', error: error.message });
  }
};

//  Delete a specific batch from a category
export const deleteBatch = async (req, res) => {
  try {
    const { categoryId, batchId } = req.params;
    const category = await liveBatchModel.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    category.batches.pull({ _id: batchId });
    await category.save();

    res.status(200).json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting batch', error: error.message });
  }
};

//  Delete entire category
export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    await liveBatchModel.findByIdAndDelete(categoryId);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting category', error: error.message });
  }
};

// DELETE a specific batch from a category
export const deleteBatchInsideCategory = async (req, res) => {
  try {
    const { categoryId, batchId } = req.params;

    //  Find the category by name
    const category = await liveBatchModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    //  Find the batch inside that category
    const batch = category.batches.id(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found in this category' });
    }

    // Delete image from Cloudinary (optional)
    if (batch.publicId) {
      try {
        await deleteFromCloudinary(batch.publicId);
      } catch (cloudErr) {
        console.warn('Cloudinary deletion failed:', cloudErr.message);
      }
    }

    //  Remove the batch from the array
    batch.deleteOne();

    //  Save the updated category
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
      category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: error.message,
    });
  }
};
