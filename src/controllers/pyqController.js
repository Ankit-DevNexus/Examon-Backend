import pyqModel from '../models/pyqModels.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

//  Add new question paper inside a category

export const addQuestionPaper = async (req, res) => {
  let uploadedFile = null;

  try {
    const { pyqCategory, title, year } = req.body;

    //  Validate inputs FIRST
    if (!pyqCategory || !title || !year) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required',
      });
    }

    //  Find or create category BEFORE upload
    let category = await pyqModel.findOne({ pyqCategory });
    if (!category) {
      category = new pyqModel({ pyqCategory, questionspaper: [] });
    }

    //  Upload ONLY after validation passes
    uploadedFile = await uploadOnCloudinary(req.file.path, 'PYQ_PDFs');
    if (!uploadedFile) {
      return res.status(500).json({
        success: false,
        message: 'PDF upload failed',
      });
    }

    // Push question paper
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
    //  ROLLBACK: delete uploaded file if anything fails
    if (uploadedFile?.public_id) {
      await deleteFromCloudinary(uploadedFile.public_id);
    }

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

    // Delete image from Cloudinary
    if (paper.publicId) {
      try {
        await deleteFromCloudinary(paper.publicId);
      } catch (cloudErr) {
        console.warn(`Cloudinary deletion  for ${paper.publicId}:`, cloudErr.message);
      }
    }

    //Remove paper from array
    paper.deleteOne();

    // Save parent document
    await category.save();

    // If this was the last batch → delete the whole category
    if (category.questionspaper.length === 0) {
      // (It’s 1 because we haven’t saved yet, and this batch still counts until we do)
      await pyqModel.findByIdAndDelete(categoryId);
      // console.log('catID', catID);

      return res.status(200).json({
        success: true,
        message: 'Batch deleted successfully and category removed as it has no batches left',
      });
    }

    await category.save();

    res.status(200).json({ success: true, message: 'Question paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting question paper', error: error.message });
  }
};

//  DELETE an entire PYQ category and all PDFs in it
// export const deletePYQCategory = async (req, res) => {
//   try {
//     const { categoryId } = req.params;

//     // Find the category by Id
//     const category = await pyqModel.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ success: false, message: 'Category not found' });
//     }

//     // Delete all PDFs from Cloudinary (if any)
//     for (const paper of category.questionspaper) {
//       if (paper.publicId) {
//         try {
//           await deleteFromCloudinary(paper.publicId);
//         } catch (err) {
//           console.warn(`Cloudinary deletion failed for ${paper.publicId}:`, err.message);
//         }
//       }
//     }

//     // Delete the category from DB
//     await pyqModel.deleteOne({ _id: category._id });

//     res.status(200).json({
//       success: true,
//       message: `Category "${category.pyqCategory}" and its question papers deleted successfully`,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting category',
//       error: error.message,
//     });
//   }
// };
export const deletePYQCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    //  Find category
    const category = await pyqModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    //  Collect all Cloudinary delete promises
    const deletePromises = category.questionspaper
      .filter((paper) => paper.publicId)
      .map((paper) =>
        deleteFromCloudinary(paper.publicId).catch((err) => {
          console.warn(
            `Cloudinary deletion failed for ${paper.publicId}:`,
            err.message
          );
        })
      );

    // Delete all PDFs in parallel
    await Promise.all(deletePromises);

    //  Delete category (auto deletes embedded PYQs)
    await pyqModel.deleteOne({ _id: category._id });

    res.status(200).json({
      success: true,
      message: `Category "${category.pyqCategory}" and all its PYQs deleted successfully`,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message,
    });
  }
};
