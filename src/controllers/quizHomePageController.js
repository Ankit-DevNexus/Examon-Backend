import quizHomePageModel from '../models/QuizHomePageModel.js';
import { v4 as uuidv4 } from 'uuid';

// Upload a new quiz (by Admin only)

export const uploadHomePageQuiz = async (req, res) => {
  try {
    const quizData = req.body;

    // Generate a unique ID for the quiz
    const quizId = 'Quiz-' + uuidv4().split('-')[0].toUpperCase();

    // Assign unique IDs to each question in the quiz
    const questionsWithIds = (quizData.questions || []).map((q) => ({
      ...q,
      id: 'Ques-' + uuidv4().split('-')[0].toUpperCase(),
    }));

    // Create quiz document
    const newQuiz = new quizHomePageModel({
      id: quizId,
      title: quizData.title,
      exam: quizData.exam,
      duration: quizData.duration,
      totalMarks: quizData.totalMarks,
      tags: quizData.tags,
      questions: questionsWithIds,
    });

    await newQuiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz uploaded successfully',
      quiz: newQuiz,
    });
  } catch (error) {
    console.error('Error uploading quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading quiz',
      error: error.message,
    });
  }
};

// Get all quizzes
export const getAllHomePageQuizzes = async (req, res) => {
  try {
    const quizzes = await quizHomePageModel.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      totalQuiz: quizzes.length,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
};

// Get a single quiz by ID
export const getHomePageQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find by MongoDB _id
    const quiz = await quizHomePageModel.findById(id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error });
  }
};

// Update quiz (Admin only)
export const updateHomePageQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    console.log('updatedData', updatedData);

    const updatedQuiz = await quizHomePageModel.findByIdAndUpdate(id, updatedData, {
      new: true, // return updated document
      runValidators: true, // validate updated fields
    });

    if (!updatedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz', error });
  }
};

// Delete quiz (Admin only)
export const deleteHomePageQuizCategory = async (req, res) => {
  try {
    const { quizId } = req.params;

    const deletedQuiz = await quizHomePageModel.findByIdAndDelete(quizId);

    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz', error });
  }
};
