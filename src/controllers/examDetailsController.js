import mongoose from 'mongoose';
import ExamModel from '../models/examDetailsModel.js';

// Create Exam
export const createExamDetails = async (req, res) => {
  try {
    // console.log('req.body:', req.body);
    // console.log('req.file:', req.file);

    const { examDetailsCategory, title, Content } = req.body;
    console.log('req.body', req.body);

    // Find or create the category
    let category = await ExamModel.findOne({ examDetailsCategory });
    if (!category) {
      category = new ExamModel({ examDetailsCategory, examDetails: [] });
    }

    // Add new question paper
    category.examDetails.push({
      title,
      Content,
    });

    const saved = await category.save();

    res.status(201).json({
      message: 'saved successfully!',
      data: saved,
    });
  } catch (err) {
    console.error('Full error details:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const uploadImageController = async (req, res) => {
  try {
    const localPath = req.file?.path;
    console.log('localPath', localPath);

    // Upload to Cloudinary
    const uploadedImage = await uploadOnCloudinary(localPath, 'Exam_Details_images');
    if (!uploadedImage) {
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

// Get All Exams
export const getAllExamsDetails = async (req, res) => {
  try {
    const exams = await ExamModel.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};

//  Get Exam by ID
export const getExamDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Find the parent doc containing this exam detail
    const parentExam = await ExamModel.findOne({ 'examDetails._id': id });

    if (!parentExam) {
      return res.status(404).json({ message: 'Exam detail not found' });
    }

    // Extract the specific subdocument
    const detail = parentExam.examDetails.id(id);

    res.status(200).json({
      success: true,
      message: 'Exam detail fetched successfully',
      data: detail,
    });
  } catch (err) {
    console.error('Error fetching exam detail:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//  Update Exam
export const updateExamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, Content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid exam detail ID' });
    }

    // Find the parent document containing this exam detail
    const parentExam = await ExamModel.findOne({ 'examDetails._id': id });
    if (!parentExam) {
      return res.status(404).json({ success: false, message: 'Exam detail not found' });
    }

    // Get the specific subdocument
    const examDetail = parentExam.examDetails.id(id);
    if (!examDetail) {
      return res.status(404).json({ success: false, message: 'Exam detail not found' });
    }

    // Update fields
    if (title?.trim()) examDetail.title = title.trim();
    if (Content?.trim()) examDetail.Content = Content.trim();

    // Save parent document
    await parentExam.save();

    res.status(200).json({
      success: true,
      message: 'Exam detail updated successfully',
      updatedDetail: examDetail,
    });
  } catch (error) {
    console.error('Error updating exam detail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const deleteExamDetailsInsideCategory = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({ success: false, message: 'Invalid exam detail ID' });
    }

    // Find the parent category where this exam detail exists
    const category = await ExamModel.findOne({ 'examDetails._id': examId });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Exam detail not found' });
    }

    // Get the specific exam inside the category
    const examDetail = category.examDetails.id(examId);

    if (!examDetail) {
      return res.status(404).json({ success: false, message: 'Exam detail not found' });
    }

    // Remove the exam detail
    examDetail.deleteOne();

    // If category becomes empty → delete entire category
    if (category.examDetails.length === 0) {
      await ExamModel.findByIdAndDelete(category._id);

      return res.status(200).json({
        success: true,
        message: 'Exam deleted. Category removed because no exams left.',
      });
    }

    // Otherwise, save modifications
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Exam detail deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting exam detail:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

//  Delete Exam
// export const deleteCategoryAndExamsDetails = async (req, res) => {
//   try {
//     const { categoryId } = req.params;

//     const category = await ExamModel.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ success: false, message: 'Category not found' });
//     }

//     await ExamModel.findByIdAndDelete(categoryId);

//     res.status(200).json({
//       success: true,
//       message: 'Category and all exams deleted successfully',
//     });
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };

// export const deleteExamDetailsInsideCategory = async (req, res) => {
//   try {
//     const { categoryId, examId } = req.params;

//     const category = await ExamModel.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ success: false, message: 'Category not found' });
//     }

//     const exam = category.examDetails.id(examId);
//     if (!exam) {
//       return res.status(404).json({ success: false, message: 'Exam not found in this category' });
//     }

//     exam.deleteOne();

//     // If this was the last exam, delete category instead of saving
//     if (category.examDetails.length === 0) {
//       await ExamModel.findByIdAndDelete(categoryId);

//       return res.status(200).json({
//         success: true,
//         message: 'Last exam deleted — category also removed successfully',
//       });
//     }

//     // Otherwise, save updated category
//     await category.save();

//     res.status(200).json({
//       success: true,
//       message: 'Exam deleted successfully from category',
//     });
//   } catch (error) {
//     console.error('Error deleting exam inside category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };

// import ExamModel from '../models/examDetailsModel.js';

// // Create Exam
// export const createExamDetails = async (req, res) => {
//   try {
//     const exam = await ExamModel.create(req.body);
//     res.status(201).json({ success: true, message: 'Exam created successfully', data: exam });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error creating exam', error: error.message });
//   }
// };

// // Get All Exams
// export const getAllExamsDetails = async (req, res) => {
//   try {
//     // Extract pagination parameters from query
//     const page = parseInt(req.query.page) || 1; // default page 1
//     const limit = parseInt(req.query.limit) || 10; // default 10 per page

//     // Calculate skip value
//     const skip = (page - 1) * limit;

//     // Fetch exams with pagination
//     const exams = await ExamModel.find().skip(skip).limit(limit);

//     // Count total documents for total pages
//     const total = await ExamModel.countDocuments();

//     res.status(200).json({
//       success: true,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalCount: total,
//       data: exams,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching exams',
//       error: error.message,
//     });
//   }
// };

// //  Get Exam by ID
// export const getExamDetailsById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const exam = await ExamModel.findById(id);
//     if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
//     res.status(200).json({ success: true, data: exam });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching exam', error: error.message });
//   }
// };

// //  Update Exam
// export const updateExamDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updated = await ExamModel.findByIdAndUpdate(id, req.body, { new: true });

//     if (!updated) return res.status(404).json({ success: false, message: 'Exam not found' });

//     res.status(200).json({
//       success: true,
//       message: 'Exam updated successfully',
//       data: updated,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error updating exam',
//       error: error.message,
//     });
//   }
// };

// //  Delete Exam
// export const deleteExamDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await ExamModel.findByIdAndDelete(id);

//     if (!deleted) return res.status(404).json({ success: false, message: 'Exam not found' });

//     res.status(200).json({ success: true, message: 'Exam deleted successfully' });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting exam',
//       error: error.message,
//     });
//   }
// };
