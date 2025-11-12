import CourseOfferModel from '../models/CourseOfferModel.js';
import ExamModel from '../models/examDetailsModel.js';
import InstructorModel from '../models/instructorModel.js';
import liveBatchModel from '../models/liveBatchesModel.js';
import pyqModel from '../models/pyqModels.js';
import quizModel from '../models/QuizModel.js';

export const globalSearch = async (req, res) => {
  try {
    const { query } = req.query; // e.g. /api/search?query=java
    if (!query || query.trim() === '') {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchRegex = new RegExp(query, 'i'); // case-insensitive search

    // Search in different collections concurrently
    const [course, exams, mentors, quizzes, liveBatches, pyqs] = await Promise.all([
      CourseOfferModel.find(
        {
          $or: [
            { examCategory: searchRegex },
            { title: searchRegex },
            { insideCourses: searchRegex },
            { description: searchRegex },
            { perks: searchRegex },
          ],
        },
        { questions: 0 }, // optional: exclude heavy nested data
      )
        .limit(10)
        .lean(),

      ExamModel.find(
        { $or: [{ title: searchRegex }, { Content: searchRegex }] },
        { password: 0 }, // exclude sensitive data
      )
        .limit(10)
        .lean(),

      InstructorModel.find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      })
        .limit(10)
        .lean(),

      quizModel
        .find(
          { $or: [{ title: searchRegex }, { exam: searchRegex }, { title: searchRegex }, { title: searchRegex }] },
          { questions: 0 }, // optional: exclude heavy nested data
        )
        .limit(10)
        .lean(),

      liveBatchModel
        .find(
          { $or: [{ batchName: searchRegex }] },
          { questions: 0 }, // optional: exclude heavy nested data
        )
        .limit(10)
        .lean(),

      pyqModel
        .find(
          { $or: [{ title: searchRegex }] },
          { questions: 0 }, // optional: exclude heavy nested data
        )
        .limit(10)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      query,
      results: {
        course,
        exams,
        mentors,
        quizzes,
        liveBatches,
        pyqs,
      },
    });
  } catch (error) {
    console.error('Error in globalSearch:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during search',
      error: error.message,
    });
  }
};
