import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema(
  {
    name: { type: String },
    designation: { type: String },
    experience: { type: String },
    specialization: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    publicId: { type: String },
    linkedin: { type: String },
    coursesLink: { type: String },
  },
  { timestamps: true },
);

const InstructorModel = mongoose.model('Instructor', instructorSchema);
export default InstructorModel;
