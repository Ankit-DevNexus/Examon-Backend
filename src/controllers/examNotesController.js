import fs from 'fs';
import StudyMaterial from '../models/examNotesModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

// CREATE
export const createExamNotes = async (req, res) => {
  try {
    const { notesCategory, title, level, language } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const filePath = req.file.path;
    const uploaded = await uploadOnCloudinary(filePath, 'study_materials');

    if (!uploaded) {
      return res.status(500).json({ success: false, message: 'Error uploading to Cloudinary' });
    }

    // Find or create category
    let categoryDoc = await StudyMaterial.findOne({ notesCategory });
    if (!categoryDoc) {
      categoryDoc = new StudyMaterial({ notesCategory, notes: [] });
    }

    // Push note into category
    categoryDoc.notes.push({
      title,
      level,
      language,
      pdfUrl: uploaded.url,
      publicId: uploaded.public_id,
    });

    const saved = await categoryDoc.save();

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error('Error creating exam notes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ ALL
export const getAllExamNotes = async (req, res) => {
  try {
    const data = await StudyMaterial.find();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ SINGLE NOTE BY CATEGORY + NOTE ID
export const getExamNotesById = async (req, res) => {
  try {
    const { categoryId, noteId } = req.params;
    const category = await StudyMaterial.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    console.log('category', category);

    const note = category.notes.id(noteId);
    console.log('note', note);

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE A NOTE
export const updateExamNotes = async (req, res) => {
  try {
    const { categoryId, noteId } = req.params;
    const { title, level, language } = req.body;

    const category = await StudyMaterial.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const note = category.notes.id(noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    // Replace PDF if new file uploaded
    if (req.file) {
      if (note.publicId) {
        await cloudinary.uploader.destroy(note.publicId, { resource_type: 'raw' });
      }

      const uploaded = await uploadOnCloudinary(req.file.path, 'study_materials');
      fs.unlinkSync(req.file.path);
      note.pdfUrl = uploaded.url;
      note.publicId = uploaded.public_id;
    }

    // Update other fields
    note.title = title || note.title;
    note.level = level || note.level;
    note.language = language || note.language;

    await category.save();

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// // DELETE A NOTE
// export const deleteExamNotes = async (req, res) => {
//   try {
//     const { categoryId, noteId } = req.params;
//     const category = await StudyMaterial.findById(categoryId);

//     if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

//     const note = category.notes.id(noteId);
//     if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

//     // Delete from Cloudinary
//     if (note.publicId) {
//       await cloudinary.uploader.destroy(note.publicId, { resource_type: 'raw' });
//     }

//     note.deleteOne(); // remove from array
//     await category.save();

//     res.status(200).json({ success: true, message: 'Note deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting note:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// DELETE A NOTE
export const deleteExamNotes = async (req, res) => {
  try {
    const { categoryId, noteId } = req.params;

    const category = await StudyMaterial.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const note = category.notes.id(noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

    // Delete file from Cloudinary
    if (note.publicId) {
      await cloudinary.uploader.destroy(note.publicId, {
        resource_type: 'raw',
      });
    }

    // Remove note from notes array
    note.deleteOne();

    // If no notes left → delete entire category
    if (category.notes.length === 0) {
      await StudyMaterial.findByIdAndDelete(categoryId);

      return res.status(200).json({
        success: true,
        message: 'Last note deleted. Category removed successfully',
      });
    }

    //  Otherwise just save updated category
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
