import pyqModel from '../models/pyqModels.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

//  Add new question paper inside a category
export const addQuestionPaper = async (req, res) => {
  try {
    const { pyqCategory, title, year } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    // Upload PDF to Cloudinary (as 'raw' file)
    const uploadedFile = await uploadOnCloudinary(req.file.path, 'PYQ_PDFs');
    if (!uploadedFile) {
      return res.status(500).json({ success: false, message: 'PDF upload failed' });
    }

    // Find or create the category
    let category = await pyqModel.findOne({ pyqCategory });
    if (!category) {
      category = new pyqModel({ pyqCategory, questionspaper: [] });
    }

    // Add new question paper
    category.questionspaper.push({
      title,
      year,
      pdf: uploadedFile.url,
      publicId: uploadedFile.public_id,
    });

    const saved = await category.save();

    res.status(201).json({
      success: true,
      message: 'Question paper added successfully',
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding question paper',
      error: error.message,
    });
  }
};

//  Get all PYQ categories with their papers
export const getAllPYQs = async (req, res) => {
  try {
    const categories = await pyqModel.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching PYQs', error: error.message });
  }
};

//  Get all question papers inside one category
export const getPYQByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await pyqModel.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching category', error: error.message });
  }
};

//  Get all question papers inside one category
export const getPYQByPaperId = async (req, res) => {
  try {
    const { categoryId, paperId } = req.params;
    const category = await pyqModel.findById(categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const paper = category.questionspaper.id(paperId);
    if (!paper) return res.status(404).json({ success: false, message: 'Paper not found' });

    res.status(200).json({ success: true, data: paper });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching category', error: error.message });
  }
};

//  Update a question paper (title, year, or PDF)
export const updateQuestionPaper = async (req, res) => {
  try {
    const { categoryId, paperId } = req.params;
    const { title, year } = req.body;

    const category = await pyqModel.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const paper = category.questionspaper.id(paperId);
    if (!paper) return res.status(404).json({ success: false, message: 'Question paper not found' });

    // Update fields
    if (title) paper.title = title;
    if (year) paper.year = year;

    // Replace PDF if new one uploaded
    if (req.file) {
      if (paper.publicId) await deleteFromCloudinary(paper.publicId);
      const uploadedFile = await uploadOnCloudinary(req.file.path, 'PYQ_PDFs');
      paper.pdf = uploadedFile.url;
      paper.publicId = uploadedFile.public_id;
    }

    await category.save();

    res.status(200).json({ success: true, message: 'Question paper updated', data: paper });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating question paper', error: error.message });
  }
};

//  Delete a single question paper from a category
export const deleteQuestionPaper = async (req, res) => {
  try {
    const { categoryId, paperId } = req.params;

    const category = await pyqModel.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const paper = category.questionspaper.id(paperId);
    if (!paper) return res.status(404).json({ success: false, message: 'Question paper not found' });

    // Delete from Cloudinary
    if (paper.publicId) {
      await deleteFromCloudinary(paper.publicId);
    }

    paper.deleteOne();
    await category.save();

    res.status(200).json({ success: true, message: 'Question paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting question paper', error: error.message });
  }
};

//  DELETE an entire PYQ category and all PDFs in it
export const deletePYQCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find the category by Id
    const category = await pyqModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Delete all PDFs from Cloudinary (if any)
    for (const paper of category.questionspaper) {
      if (paper.publicId) {
        try {
          await deleteFromCloudinary(paper.publicId);
        } catch (err) {
          console.warn(`Cloudinary deletion failed for ${paper.publicId}:`, err.message);
        }
      }
    }

    // Delete the category from DB
    await pyqModel.deleteOne({ _id: category._id });

    res.status(200).json({
      success: true,
      message: `Category "${category.pyqCategory}" and its question papers deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
};
