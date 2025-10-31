import mongoose from 'mongoose';

const dateSchema = new mongoose.Schema({
  description: String,
  date: String,
});

const feeSchema = new mongoose.Schema({
  category: String,
  amount: String,
});

const eligibilitySchema = new mongoose.Schema({
  qualification: String,
  age_limit: String,
});

const examPatternSchema = new mongoose.Schema({
  stages: [String],
  mode: String,
});

const examSchema = new mongoose.Schema(
  {
    name: { type: String },
    year: { type: Number },
    important_dates: [dateSchema],
    application_fee: [feeSchema],
    eligibility: eligibilitySchema,
    exam_pattern: examPatternSchema,
  },
  { timestamps: true },
);

const ExamModel = mongoose.model('ExamDetails', examSchema);
export default ExamModel;
