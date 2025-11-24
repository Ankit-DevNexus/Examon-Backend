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
    const { categoryId, examId } = req.params;

    const category = await ExamModel.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const exam = category.examDetails.id(examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Batch not found' });

    res.status(200).json({
      success: true,
      message: 'Exam detail fetched successfully',
      data: exam,
    });
  } catch (err) {
    console.error('Error fetching exam detail:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//  Update Exam
export const updateExamDetails = async (req, res) => {
  try {
    const { categoryId, detailId } = req.params;
    const { title, Content } = req.body;

    if (!categoryId || !detailId) {
      return res.status(400).json({
        success: false,
        message: 'categoryId and detailId are required',
      });
    }

    // Prepare update object
    const updatedData = {};
    if (title !== undefined) updatedData['examDetails.$.title'] = title;
    if (Content !== undefined) updatedData['examDetails.$.Content'] = Content;

    // Update using positional operator $
    const updatedCategory = await ExamModel.findOneAndUpdate(
      { _id: categoryId, 'examDetails._id': detailId },
      { $set: updatedData },
      { new: true },
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Exam detail not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exam detail updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    console.log('Error updating exam detail:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

//  Delete Exam
export const deleteCategoryAndExamsDetails = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await ExamModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await ExamModel.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: 'Category and all exams deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

export const deleteExamDetailsInsideCategory = async (req, res) => {
  try {
    const { categoryId, examId } = req.params;

    const category = await ExamModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const exam = category.examDetails.id(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found in this category' });
    }

    exam.deleteOne();

    // If this was the last exam, delete category instead of saving
    if (category.examDetails.length === 0) {
      await ExamModel.findByIdAndDelete(categoryId);

      return res.status(200).json({
        success: true,
        message: 'Last exam deleted — category also removed successfully',
      });
    }

    // Otherwise, save updated category
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully from category',
    });
  } catch (error) {
    console.error('Error deleting exam inside category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

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
