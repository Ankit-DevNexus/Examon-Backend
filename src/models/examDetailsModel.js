import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    featuredImage: {
      type: String,
    },
    title: {
      type: String,
    },
    Content: {
      type: String,
      required: true,
    },
    publicId: { type: String },
  },
  {
    timestamps: true,
  },
);

const ExamModel = mongoose.model('ExamDetails', examSchema);
export default ExamModel;
