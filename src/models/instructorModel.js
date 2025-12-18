import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema(
  {
    imageUrl: { type: String },
    publicId: { type: String },
    name: { type: String },
    subjectTaught: { type: String },
    experience: { type: String },
    CoursesHandled: [{ type: String, default: [] }],
    specialization: { type: String },
    description: { type: String },
    youtubeLink: { type: String },
    coursesLink: { type: String },
  },
  { timestamps: true },
);

const InstructorModel = mongoose.model('Instructor', instructorSchema);
export default InstructorModel;
