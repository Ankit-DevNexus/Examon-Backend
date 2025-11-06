import CourseOfferModel from '../models/CourseOfferModel.js';
import InstructorModel from '../models/instructorModel.js';
import liveBatchModel from '../models/liveBatchesModel.js';
import pyqModel from '../models/pyqModels.js';
import quizModel from '../models/QuizModel.js';

export const totalCountController = async (req, res) => {
  try {
    const Mentors = await InstructorModel.find().sort({ createAt: -1 });
    const Courses = await CourseOfferModel.find().sort({ createAt: -1 });
    const Quizzes = await quizModel.find().sort({ createAt: -1 });
    const PYQs = await pyqModel.find().sort({ createAt: -1 });
    const Batches = await liveBatchModel.find().sort({ createAt: -1 });
    // console.log('totalMentors', totalMentors);

    return res.status(200).json({
      Message: 'Fetched successfully',
      MentorsCount: Mentors.length,
      CoursesCount: Courses.length,
      QuizzesCount: Quizzes.length,
      PYQsCount: PYQs.length,
      BatchesCount: Batches.length,
      Mentors: Mentors.slice(0, 3),
      Courses: Courses.slice(0, 3),
      Quizzes: Quizzes.slice(0, 3),
      PYQs: PYQs.slice(0, 3),
      Batches: Batches.slice(0, 3),
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
