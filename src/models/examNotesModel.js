import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    level: { type: String, required: true },
    language: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    publicId: { type: String }, // Cloudinary public ID
  },
  { timestamps: true },
);

const studyCategorySchema = new mongoose.Schema(
  {
    notesCategory: { type: String, unique: true, required: true },
    notes: [studyMaterialSchema],
  },
  { timestamps: true },
);

const StudyMaterial = mongoose.model('StudyMaterial', studyCategorySchema);
export default StudyMaterial;
