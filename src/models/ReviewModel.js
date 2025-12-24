import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    clientname: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: ""
    },
    star: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      ENUM: ['approved', 'reject', 'pending'],
      default: 'pending',
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
);

const ReviewModel = mongoose.model('Review', ReviewSchema);

export default ReviewModel;
