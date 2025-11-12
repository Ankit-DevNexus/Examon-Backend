import { generateToken } from '../config/jwt.js';
import QuizAttemptModel from '../models/QuizAttemptModel.js';
import quizModel from '../models/QuizModel.js';
import userModel from '../models/userModel.js';
import profileModel from '../models/ProfileModel.js';

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

    // Create new user
    const newUser = await userModel.create({
      fullname,
      email,
      password,
      role: role || 'user',
    });

    // Automatically create linked profile with empty fields
    await profileModel.create({
      userId: newUser._id,
      profileImage: '',
      preferedCourse: '', // empty
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

// export const signup = async (req, res) => {
//   try {
//     const { fullname, email, password, role } = req.body;

//     if (!fullname || !email || !password) {
//       return res.status(400).json({ msg: 'All fields are required' });
//     }

//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ msg: 'Email already exists' });
//     }

//     const newUser = await userModel.create({
//       fullname,
//       email,
//       password,
//       role: role || 'user',
//     });

//     await profileModel.create({
//       publicId: '',
//       userId: req.user._id || '',
//       profileImage: '',
//       phone: '',
//       preferedCourse: '',
//     });

//     res.status(201).json({
//       message: 'User created successfully',
//       user: {
//         _id: newUser._id,
//         fullname: newUser.fullname,
//         email: newUser.email,
//         role: newUser.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ msg: 'Error creating user', error: error.message });
//   }
// };

//  USER LOGIN

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await userModel.findOne({ email });
//     if (!user) return res.status(400).json({ msg: 'User not found' });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

//     // Generate tokens
//     const { accessToken, refreshToken, expiresIn } = generateToken(user);

//     // Update user login info
//     user.refreshToken = refreshToken;
//     user.lastLogin = new Date();
//     user.loginHistory.push({
//       loginAt: user.lastLogin,
//       ip: req.ip,
//       userAgent: req.headers['user-agent'],
//     });
//     await user.save();

//     // Store refresh token in cookie
//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/api/refresh',
//       maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//     });

//     // Fetch profile data linked to user
//     const profile = await profileModel.findOne({ userId: user._id }).lean();

//     // Optional: Fetch quiz attempts
//     const quizAttempts = await QuizAttemptModel.find({ userId: user._id }).lean();

//     const detailedAttempts = await Promise.all(
//       quizAttempts.map(async (attempt) => {
//         const quiz = await quizModel.findOne({ id: attempt.quizId }).lean();
//         if (!quiz) return attempt;

//         return {
//           quizId: attempt.quizId,
//           quizTitle: quiz.title,
//           score: attempt.score,
//           totalMarks: attempt.totalMarks,
//           attemptedAt: attempt.attemptedAt,
//         };
//       }),
//     );

//     // Build final response
//     const userData = user.toObject();
//     delete userData.password;

//     res.status(200).json({
//       message: 'Login successful',
//       accessToken,
//       expiresIn,
//       user: {
//         _id: user._id,
//         fullname: user.fullname,
//         email: user.email,
//         role: user.role,
//         phone: profile?.phone || '',
//         profileImage: profile?.profileImage || '',
//         preferedCourse: profile?.preferedCourse || '',
//         attemptedQuizzes: detailedAttempts,
//       },
//     });
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ msg: 'Server error during login', error: error.message });
//   }
// };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const { accessToken, refreshToken, expiresIn } = generateToken(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginHistory.push({
      loginAt: user.lastLogin,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const profile = await profileModel.findOne({ userId: user._id }).lean();
    const quizAttempts = await QuizAttemptModel.find({ userId: user._id }).lean();

    // Enrich quiz attempts with quiz and question details
    const detailedAttempts = await Promise.all(
      quizAttempts.map(async (attempt) => {
        const quiz = (await quizModel.findById(attempt.quizId).lean()) || (await quizModel.findOne({ id: attempt.quizId }).lean());
        if (!quiz) return attempt;

        // Build a question-answer mapping for clarity
        const formattedQA = attempt.answers.map((ans) => {
          const question = quiz.questions.find((q) => q.id === ans.questionId);
          if (!question) return null;

          return {
            questionId: question.id,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswerIndex,
            userAnswer: ans.selectedIndex,
            isCorrect: ans.isCorrect,
            marks: question.marks,
            topic: question.topic,
            difficulty: question.difficulty,
          };
        });

        return {
          quizId: attempt.quizId,
          quizTitle: quiz.title,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          attemptedAt: attempt.attemptedAt,
          questions: formattedQA.filter(Boolean), // remove nulls
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
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        phone: profile?.phone || '',
        profileImage: profile?.profileImage || '',
        preferedCourse: profile?.preferedCourse || '',
        attemptedQuizzes: detailedAttempts,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ msg: 'Server error during login', error: error.message });
  }
};

// get all users
export const allUsers = (req, res) => {
  try {
  } catch (error) {}
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
