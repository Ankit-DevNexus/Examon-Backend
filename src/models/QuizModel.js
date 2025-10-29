import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: String,
  type: String,
  question: String,
  options: [String],
  correctAnswerIndex: Number,
  marks: Number,
  topic: String,
  difficulty: String,
});

const quizSchema = new mongoose.Schema(
  {
    id: String,
    title: String,
    exam: String,
    duration: Number,
    totalMarks: Number,
    tags: [String],
    questions: [questionSchema],
  },
  { timestamps: true },
);

const quizModel = mongoose.model('Quiz', quizSchema);
export default quizModel;
