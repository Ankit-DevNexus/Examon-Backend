import jwt from 'jsonwebtoken';
import { generateToken } from '../config/jwt.js';
import QuizAttemptModel from '../models/QuizAttemptModel.js';
import quizModel from '../models/QuizModel.js';
import userModel from '../models/userModel.js';

//  USER SIGNUP
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
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: 'Error creating user', error: error.message });
  }
};

//  USER LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    //  Generate Access & Refresh tokens
    const { accessToken, refreshToken, expiresIn } = generateToken(user);

    //  Save refresh token in DB
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginHistory.push({
      loginAt: user.lastLogin,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    await user.save();

    //  Store refresh token in secure HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    //  Fetch user quiz history (optional)
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
      accessToken,
      expiresIn,
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

//  REFRESH ACCESS TOKEN
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ msg: 'No refresh token provided' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(403).json({ msg: 'Invalid or revoked refresh token' });
    }
    const expiresIn = 15 * 60;

    //  Generate a new short-lived access token
    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn,
    });

    res.json({ accessToken: newAccessToken, expiresIn });
  } catch (err) {
    res.status(401).json({ msg: 'Refresh token invalid or expired', error: err.message });
  }
};

//  LOGOUT
export const logout = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      user.tokenVersion += 1;
      await user.save();
    }

    res.clearCookie('refreshToken', { path: '/api/refresh' });
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Logout failed', error: err.message });
  }
};

// DELETE ALL USERS (Admin only)
export const deleteUsers = async (req, res) => {
  try {
    const result = await userModel.deleteMany({});
    res.status(200).json({ message: 'All users deleted', deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ msg: 'Error deleting users', error: error.message });
  }
};
