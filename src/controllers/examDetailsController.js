import ExamModel from '../models/examDetailsModel.js';

// Create Exam
export const createExamDetails = async (req, res) => {
  try {
    const exam = await ExamModel.create(req.body);
    res.status(201).json({ success: true, message: 'Exam created successfully', data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating exam', error: error.message });
  }
};

// Get All Exams
// ✅ Get All Exams with Pagination
export const getAllExamsDetails = async (req, res) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1; // default page 1
    const limit = parseInt(req.query.limit) || 10; // default 10 per page

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Fetch exams with pagination
    const exams = await ExamModel.find().skip(skip).limit(limit);

    // Count total documents for total pages
    const total = await ExamModel.countDocuments();

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      data: exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching exams',
      error: error.message,
    });
  }
};

//  Get Exam by ID
export const getExamDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await ExamModel.findById(id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching exam', error: error.message });
  }
};

//  Update Exam
export const updateExamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ExamModel.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) return res.status(404).json({ success: false, message: 'Exam not found' });

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating exam',
      error: error.message,
    });
  }
};

//  Delete Exam
export const deleteExamDetails = async (req, res) => {
  try {
    const deleted = await ExamModel.findByIdAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.status(200).json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting exam', error: error.message });
  }
};
