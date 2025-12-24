import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    year: [{ type: String, required: true }],
    pdf: { type: String, required: true },
    publicId: { type: String },
  },
  { timestamps: true },
);

const pyqCategorySchema = new mongoose.Schema(
  {
    pyqCategory: { type: String, required: true, unique: true, lowercase: true },
    questionspaper: [questionPaperSchema],
  },
  { timestamps: true },
);

const pyqModel = mongoose.model('pyq', pyqCategorySchema);
export default pyqModel;
