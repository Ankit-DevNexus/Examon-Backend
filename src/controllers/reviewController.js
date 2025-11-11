import ReviewModel from '../models/ReviewModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
// import { v2 as cloudinary } from 'cloudinary';
// const JWT_SECRET = process.env.JWT_SECRET;

export const createReview = async (req, res) => {
  try {
    const { clientname, profilePicture, star, review, course, status } = req.body;

    if (!clientname || !star || !review || !course) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    const starNumber = Number(star);
    if (isNaN(starNumber) || starNumber < 1 || starNumber > 5) {
      return res.status(400).json({
        success: false,
        message: 'Star must be a number between 1 and 5.',
      });
    }

    // const imageReview = req.file?.path;
    // if (!imageReview) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Review image is missing',
    //   });
    // }

    // const uploadedImage = await uploadOnCloudinary(imageReview, 'review_images');
    // if (!uploadedImage) {
    //   return res.status(500).json({
    //     success: false,
    //     message: 'Error uploading image to Cloudinary',
    //   });
    // }

    // console.log('req.user._id', req.user._id);

    const newReview = new ReviewModel({
      clientname,
      profilePicture,
      star: starNumber,
      review,
      course,
      status,
      clientId: req.user._id,
    });

    const savedReview = await newReview.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: savedReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting review.',
      error: error.message,
    });
  }
};

export const getAllReview = async (req, res) => {
  try {
    const allReviews = await ReviewModel.find().sort({ createdAt: -1 });

    // if (!allReviews || allReviews.length === 0) {
    //   return res.status(200).json({
    //     success: false,
    //     message: 'No reviews found.',
    //   });
    // }

    res.status(200).json({
      success: true,
      message: 'All Review fetched successfully',
      count: allReviews.length,
      data: allReviews || [],
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews.',
      error: error.message,
    });
  }
};

// UPDATE REVIEW
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientname, star, review, course, status } = req.body;

    // Validate review ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required.',
      });
    }

    // Find existing review
    const existingReview = await ReviewModel.findById(id);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    // Prepare update data
    const updatedData = {};

    if (clientname) updatedData.clientname = clientname;
    if (review) updatedData.review = review;
    if (course) updatedData.course = course;
    if (status) updatedData.status = status;

    // Validate and update star
    if (star) {
      const starNumber = Number(star);
      if (isNaN(starNumber) || starNumber < 1 || starNumber > 5) {
        return res.status(400).json({
          success: false,
          message: 'Star must be a number between 1 and 5.',
        });
      }
      updatedData.star = starNumber;
    }

    // Handle image update (if new image is uploaded)
    if (req.file?.path) {
      const newImagePath = req.file.path;

      // Delete old image from Cloudinary (if exists)
      if (existingReview.publicId) {
        try {
          await cloudinary.uploader.destroy(existingReview.publicId);
        } catch (cloudErr) {
          console.error('Error deleting old image from Cloudinary:', cloudErr.message);
        }
      }

      // Upload new image to Cloudinary
      const uploadedImage = await uploadOnCloudinary(newImagePath);
      if (uploadedImage) {
        updatedData.profilePicture = uploadedImage.url;
        updatedData.publicId = uploadedImage.public_id;
      }
    }

    // Update review in DB
    const updatedReview = await ReviewModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review.',
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate review ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Review ID is required.',
      });
    }

    // Find review by ID
    const review = await ReviewModel.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    // Delete image from Cloudinary (if exists)
    if (review.publicId) {
      try {
        await cloudinary.uploader.destroy(review.publicId);
      } catch (cloudErr) {
        console.error('Error deleting image from Cloudinary:', cloudErr.message);
      }
    }

    // Delete review from DB
    await ReviewModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review.',
      error: error.message,
    });
  }
};

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

    // Store refresh token in secure HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    //  Fetch user quiz history (optional)
    const quizAttempts = await QuizAttemptModel.find({ userId: user._id }).lean();
    // console.log('quizAttempts in login', quizAttempts);

    const detailedAttempts = await Promise.all(
      quizAttempts.map(async (attempt) => {
        const quiz = await quizModel.findOne({ id: attempt.quizId }).lean();
        // console.log('quiz in login', quiz);

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
