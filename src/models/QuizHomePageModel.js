import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const questionHomeSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  type: String,
  question: String,
  options: [String],
  correctAnswerIndex: Number,
  marks: Number,
  topic: String,
  difficulty: String,
});

const quizHomeSchema = new mongoose.Schema(
  {
    id: { type: String, default: uuidv4 },
    title: String,
    exam: String,
    duration: Number,
    totalMarks: Number,
    tags: [String],
    questions: [questionHomeSchema],
  },
  { timestamps: true },
);

const quizHomePageModel = mongoose.model('QuizHomePage', quizHomeSchema);
export default quizHomePageModel;
