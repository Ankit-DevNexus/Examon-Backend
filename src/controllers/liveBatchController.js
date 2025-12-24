import liveBatchModel from '../models/liveBatchesModel.js';
import dotenv from 'dotenv';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';

dotenv.config();

//  Create / Add a new batch in a category
export const addBatchToCategory = async (req, res) => {
  try {
    const { batchCategory, batchName, syllabus, duration, price, discount, discountPercent, perks, description, teachers, enrollLink } =
      req.body;

    const files = [...(req.files?.image1 || []), ...(req.files?.image2 || [])];

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const upload = await uploadOnCloudinary(file.path, 'Batch_images');
        return upload;
      }),
    );

    let existingCategory = await liveBatchModel.findOne({ batchCategory });
    if (!existingCategory) {
      existingCategory = new liveBatchModel({ batchCategory, batches: [] });
    }

    existingCategory.batches.push({
      batchName,
      syllabus,
      duration,
      price,
      discount,
      discountPercent,
      perks,
      description,
      teachers,
      enrollLink,

      images: uploadedFiles.map((f) => f.url),
      publicIds: uploadedFiles.map((f) => f.public_id),
      resourceType: uploadedFiles.map((f) => f.resource_type),
    });

    const saved = await existingCategory.save();

    res.status(201).json({ success: true, message: 'Batch added successfully', category: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding batch', error: error.message });
  }
};

//Get all categories with batches
export const getAllCategories = async (req, res) => {
  try {
    const categories = await liveBatchModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      totalCategory: categories.length,
      categories,
    });
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

export const getAllBatchName = async (req, res) => {
  try {
    // {} - Find ALL documents in the liveBatchModel collection.
    // "Return only the batchName inside the batches array."
    const categories = await liveBatchModel.find({}, { 'batches.batchName': 1 });

    const batchNames = categories.flatMap((cat) => cat.batches.map((b) => b.batchName));

    res.status(200).json({
      success: true,
      total: batchNames.length,
      batchNames,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching batch names',
      error: error.message,
    });
  }
};

// export const getAllBatchName = async (req, res) => {
//   try {
//     const category = await liveBatchModel.find().sort({ createdAt: -1});
//     if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

//     const batchName = await liveBatchModel.f

//     res.status(200).json({ success: true, batches: category.batches });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching batches', error: error.message });
//   }
// };

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
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const batch = category.batches.id(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    //  UPDATE TEXT FIELDS 
    const updatableFields = [
      'batchName',
      'syllabus',
      'duration',
      'price',
      'discount',
      'discountPercent',
      'perks',
      'description',
      'teachers',
      'enrollLink',
      'description',
      'perks',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        batch[field] = req.body[field];
      }
    });

    //  UPDATE IMAGES (SELECTIVE) 
    if (req.files) {
      // Ensure arrays exist
      if (!batch.images) batch.images = [];
      if (!batch.publicIds) batch.publicIds = [];

      //  IMAGE 1 
      if (req.files.image1) {
        // delete old image1 only
        if (batch.publicIds[0]) {
          await deleteFromCloudinary(batch.publicIds[0]);
        }

        const img1 = await uploadOnCloudinary(
          req.files.image1[0].path,
          'Batch_images'
        );

        batch.images[0] = img1.url;
        batch.publicIds[0] = img1.public_id;
      }

      //  IMAGE 2 
      if (req.files.image2) {
        // delete old image2 only
        if (batch.publicIds[1]) {
          await deleteFromCloudinary(batch.publicIds[1]);
        }

        const img2 = await uploadOnCloudinary(
          req.files.image2[0].path,
          'Batch_images'
        );

        batch.images[1] = img2.url;
        batch.publicIds[1] = img2.public_id;
      }
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: error.message,
    });
  }
};


// export const updateBatch = async (req, res) => {
//   try {
//     const { categoryId, batchId } = req.params;
//     console.log('Req', req.body);

//     const category = await liveBatchModel.findById(categoryId);
//     if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

//     const batch = category.batches.id(batchId);
//     if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

//     // Update image if a new one is uploaded
//     if (req.files) {
//       const imageUrl = await uploadOnCloudinary(req.file.path, 'Batch_images');
//       //   console.log('imageUrl', imageUrl);

//       if (imageUrl.url) {
//         batch.images = imageUrl.url;
//         batch.publicIds = imageUrl.public_id;
//         await deleteFromCloudinary(batch.publicIds);
//       }
//     }

//     const updatableFields = ['batchName', 'syllabus', 'duration', 'price','perks', 'description', 'teachers', 'enrollLink'];
//     updatableFields.forEach((field) => {
//       if (req.body[field] !== undefined) batch[field] = req.body[field];
//     });

//     await category.save();
//     res.status(200).json({ success: true, message: 'Batch updated successfully', batch });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error updating batch', error: error.message });
//   }
// };

//  Delete a specific batch from a category
// export const deleteBatch = async (req, res) => {
//   try {
//     const { categoryId, batchId } = req.params;
//     const category = await liveBatchModel.findById(categoryId);
//     if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

//     category.batches.pull({ _id: batchId });
//     await category.save();

//     res.status(200).json({ success: true, message: 'Batch deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error deleting batch', error: error.message });
//   }
// };

//  Delete entire category

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await liveBatchModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // 🔥 Delete all files (images / PDFs) from all batches
    for (const batch of category.batches) {
      if (batch.publicIds?.length && batch.resourceType?.length) {
        for (let i = 0; i < batch.publicIds.length; i++) {
          await deleteFromCloudinary(batch.publicIds[i], batch.resourceType[i]);
        }
      }
    }

    // Delete category AFTER Cloudinary cleanup
    await liveBatchModel.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: 'Category and all files deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
};

// DELETE a specific batch from a category
export const deleteBatchInsideCategory = async (req, res) => {
  try {
    const { categoryId, batchId } = req.params;

    const category = await liveBatchModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const batch = category.batches.id(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // 🔥 Delete all files for this batch
    if (batch.publicIds?.length && batch.resourceType?.length) {
      for (let i = 0; i < batch.publicIds.length; i++) {
        await deleteFromCloudinary(batch.publicIds[i], batch.resourceType[i]);
      }
    }

    batch.deleteOne();

    // If this was the last batch → delete category
    if (category.batches.length === 0) {
      await liveBatchModel.findByIdAndDelete(categoryId);

      return res.status(200).json({
        success: true,
        message: 'Batch and category deleted successfully',
      });
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: error.message,
    });
  }
};
