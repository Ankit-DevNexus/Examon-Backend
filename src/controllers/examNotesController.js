import fs from 'fs';
import StudyMaterial from '../models/examNotesModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// CREATE
export const createMaterial = async (req, res) => {
  try {
    const { category, title, level, language } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const notesPdf = req.file?.path;
    if (!notesPdf) {
      return res.status(400).json({
        success: false,
        message: 'Notes pdf is missing',
      });
    }
    console.log('notesPdf', notesPdf);

    const uploadednotes = await uploadOnCloudinary(notesPdf);
    if (!uploadednotes) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading image to Cloudinary',
      });
    }

    // Save to MongoDB
    const newMaterial = new StudyMaterial({
      category,
      title,
      level,
      language,
      pdfUrl: uploadednotes.url,
      publicId: uploadednotes.public_id,
    });

    await newMaterial.save();

    // Delete local file
    fs.unlinkSync(req.file.path);

    res.status(201).json({ success: true, data: newMaterial });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ ALL
export const getAllMaterials = async (req, res) => {
  try {
    const materials = await StudyMaterial.find();
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// READ ONE
export const getMaterialById = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    res.status(200).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE (with optional PDF re-upload)
export const updateMaterial = async (req, res) => {
  try {
    const { category, title, level, language } = req.body;
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    let pdfUrl = material.pdfUrl;
    let publicId = material.publicId;

    // If a new file is uploaded, replace it on Cloudinary
    if (req.file) {
      // Delete old file from Cloudinary
      if (material.publicId) {
        await cloudinary.uploader.destroy(material.publicId, { resource_type: 'raw' });
      }

      const uploadRes = await cloudinary.uploader.upload(req.file.path, {
        folder: 'study_materials',
        resource_type: 'raw',
      });

      pdfUrl = uploadRes.secure_url;
      publicId = uploadRes.public_id;

      fs.unlinkSync(req.file.path);
    }

    const updated = await StudyMaterial.findByIdAndUpdate(
      req.params.id,
      { category, title, level, language, pdfUrl, publicId },
      { new: true },
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
export const deleteMaterial = async (req, res) => {
  try {
    const material = await StudyMaterial.findById(req.params.id);

    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    // Delete file from Cloudinary
    if (material.publicId) {
      await cloudinary.uploader.destroy(material.publicId, { resource_type: 'raw' });
    }

    await material.deleteOne();

    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
