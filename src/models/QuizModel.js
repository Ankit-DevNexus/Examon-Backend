import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const questionSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
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
    id: { type: String, default: uuidv4 },
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
