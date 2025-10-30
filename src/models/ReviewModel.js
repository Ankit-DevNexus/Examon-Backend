import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    clientname: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      // required: true
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
    publicId: {
      type: String,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // actual name of model
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
    },
  },
  {
    timestamps: true,
  },
);

const ReviewModel = mongoose.model('Review', ReviewSchema);

export default ReviewModel;
