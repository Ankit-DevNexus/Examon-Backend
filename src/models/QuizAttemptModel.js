import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  quizId: {
    type: String,
    required: true,
  },
  answers: [
    {
      questionId: String,
      selectedIndex: Number,
      correctAnswerIndex: Number,
      isCorrect: Boolean,
    },
  ],
  score: Number,
  totalMarks: Number,
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('quizAttempt', quizAttemptSchema);
