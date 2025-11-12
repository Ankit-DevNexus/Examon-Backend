import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    Content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const examDetailsCategorySchema = new mongoose.Schema(
  {
    examDetailsCategory: { type: String, required: true, unique: true, lowercase: true },
    examDetails: [examSchema],
  },
  { timestamps: true },
);

const ExamModel = mongoose.model('ExamDetails', examDetailsCategorySchema);
export default ExamModel;
