import { generateToken } from '../config/jwt.js';
import QuizAttemptModel from '../models/QuizAttemptModel.js';
import quizModel from '../models/QuizModel.js';
import userModel from '../models/userModel.js';

export const signup = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    const newUser = await userModel.create({
      fullname,
      email,
      password,
      role: role || 'user',
    });

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error creating user', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = generateToken(user);

    //     // Update login info
    user.lastLogin = new Date();
    user.loginHistory.push({
      loginAt: user.lastLogin,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Fetch quiz attempts
    const quizAttempts = await QuizAttemptModel.find({ userId: user._id }).lean();

    const detailedAttempts = await Promise.all(
      quizAttempts.map(async (attempt) => {
        const quiz = await quizModel.findOne({ id: attempt.quizId }).lean();
        if (!quiz) return attempt;

        return {
          quizId: attempt.quizId,
          quizTitle: quiz.title,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          attemptedAt: attempt.attemptedAt,
          answers: attempt.answers.map((ans) => {
            const q = quiz.questions.find((qq) => qq.id === ans.questionId);
            return {
              question: q ? q.question : 'Question not found',
              options: q ? q.options : [],
              selectedIndex: ans.selectedIndex,
              correctAnswerIndex: ans.correctAnswerIndex,
              isCorrect: ans.isCorrect,
            };
          }),
        };
      }),
    );

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        ...userData,
        attemptedQuizzes: detailedAttempts,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ msg: 'Server error during login', error: error.message });
  }
};

export const deleteusers = async (req, res) => {
  const user = await userModel.deleteMany();

  res.status(200).json({
    message: 'deleted',
    user,
  });
};
