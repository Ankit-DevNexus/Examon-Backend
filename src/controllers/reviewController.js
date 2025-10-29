import ReviewModel from '../models/ReviewModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
// import { v2 as cloudinary } from 'cloudinary';
// const JWT_SECRET = process.env.JWT_SECRET;

export const createReview = async (req, res) => {
  try {
    const { clientname, star, review, course, status } = req.body;

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

    const imageReview = req.file?.path;
    if (!imageReview) {
      return res.status(400).json({
        success: false,
        message: 'Review image is missing',
      });
    }

    const uploadedImage = await uploadOnCloudinary(imageReview);
    if (!uploadedImage) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading image to Cloudinary',
      });
    }

    console.log('req.user._id', req.user._id);

    const newReview = new ReviewModel({
      clientname,
      profilePicture: uploadedImage.url || '',
      star: starNumber,
      review,
      course,
      status,
      publicId: uploadedImage.public_id || '',
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
    const allReviews = await ReviewModel.find().sort({ date: -1 });

    if (!allReviews || allReviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No reviews found.',
      });
    }

    res.status(200).json({
      success: true,
      count: allReviews.length,
      data: allReviews,
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
