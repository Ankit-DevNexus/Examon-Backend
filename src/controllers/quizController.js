import QuizAttemptModel from '../models/QuizAttemptModel.js';
import quizModel from '../models/QuizModel.js';

// Upload a new quiz (by Admin only)
export const uploadQuiz = async (req, res) => {
  try {
    const quizData = req.body;

    // Check if quiz with same ID already exists
    // const existingQuiz = await quizModel.findOne({ id: quizData.id });
    // if (existingQuiz) {
    //   return res.status(400).json({ message: 'Quiz with this ID already exists' });
    // }

    const newQuiz = new quizModel(quizData);
    await newQuiz.save();

    res.status(201).json({
      message: 'Quiz uploaded successfully',
      quiz: newQuiz,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading quiz', error });
  }
};

// Get all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await quizModel.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      totalQuiz: quizzes.length,
      quizzes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
};

// Get a single quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find by MongoDB _id
    const quiz = await quizModel.findById(id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error });
  }
};

// Update quiz (Admin only)
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    console.log('updatedData', updatedData);

    const updatedQuiz = await quizModel.findByIdAndUpdate(id, updatedData, {
      new: true, // return updated document
      runValidators: true, // validate updated fields
    });

    if (!updatedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz', error });
  }
};

// Delete quiz (Admin only)
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedQuiz = await quizModel.findByIdAndDelete(id);

    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting quiz', error });
  }
};

// Submit quiz and calculate score

export const submitQuiz = async (req, res) => {
  try {
    const userId = req.user._id; // coming from middleware (auth)
    const { answers } = req.body;
    const quizId = req.params.id;

    // console.log('quizId', quizId);

    const quiz = await quizModel.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    // console.log('quiz', quiz);

    // Calculate score
    let score = 0;
    const detailedAnswers = quiz.questions.map((ques) => {
      // console.log('ques', ques);
      const userAnswer = answers.find((ans) => ans.questionId === ques.id);
      // console.log('userAnswer', userAnswer);

      const isCorrect = userAnswer && userAnswer.selectedIndex === ques.correctAnswerIndex;
      // console.log('isCorrect', isCorrect);

      if (isCorrect) score += ques.marks;
      return {
        questionId: ques.id,
        question: ques.question,
        options: ques.options,
        selectedIndex: userAnswer ? userAnswer.selectedIndex : null,
        correctAnswerIndex: ques.correctAnswerIndex,
        isCorrect,
        marks: ques.marks,
        topic: ques.topic,
      };
    });

    // Check if user has already attempted the quiz
    const existingAttempt = await QuizAttemptModel.findOne({ userId, quizId });

    if (existingAttempt) {
      if (score > existingAttempt.score) {
        // Update only if the new score is higher
        existingAttempt.score = score;
        existingAttempt.answers = detailedAnswers;
        existingAttempt.totalMarks = quiz.totalMarks;
        existingAttempt.attemptedAt = new Date();
        await existingAttempt.save();

        return res.status(200).json({
          message: 'Quiz reattempt recorded — new higher score updated!',
          score,
          totalMarks: quiz.totalMarks,
          detailedAnswers,
          questions: quiz.questions,
        });
      } else {
        // Keep old score if new one is not higher
        return res.status(200).json({
          message: 'Quiz already attempted — new score is lower, so not updated.',
          previousScore: existingAttempt.score,
          newScore: score,
          totalMarks: quiz.totalMarks,
          detailedAnswers: existingAttempt.answers,
          questions: quiz.questions,
        });
      }
    }

    // Create a new attempt if user is attempting for the first time
    await QuizAttemptModel.create({
      userId,
      quizId,
      answers: detailedAnswers,
      score,
      totalMarks: quiz.totalMarks,
    });

    res.status(200).json({
      message: 'Quiz submitted successfully',
      score,
      totalMarks: quiz.totalMarks,
      detailedAnswers,
      questions: quiz.questions,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz', error });
  }
};

// export const submitQuiz = async (req, res) => {
//   try {
//     const userId = req.user._id; // coming from middleware (auth)
//     const { answers } = req.body;
//     const quizId = req.params.id;

//     const quiz = await quizModel.findOne({ id: quizId }).lean();
//     if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

//     // Calculate score
//     let score = 0;
//     const detailedAnswers = quiz.questions.map((ques) => {
//       const userAnswer = answers.find((ans) => ans.questionId === ques.id);
//       const isCorrect = userAnswer && userAnswer.selectedIndex === ques.correctAnswerIndex;
//       if (isCorrect) score += ques.marks;
//       return {
//         questionId: ques.id,
//         question: ques.question,
//         options: ques.options,
//         selectedIndex: userAnswer ? userAnswer.selectedIndex : null,
//         correctAnswerIndex: ques.correctAnswerIndex,
//         isCorrect,
//         marks: ques.marks,
//         topic: ques.topic,
//       };
//     });

//     // Check if user has already attempted the quiz
//     const existingAttempt = await QuizAttemptModel.findOne({ userId, quizId });

//     if (existingAttempt) {
//       if (score > existingAttempt.score) {
//         // Update only if the new score is higher
//         existingAttempt.score = score;
//         existingAttempt.answers = detailedAnswers;
//         existingAttempt.totalMarks = quiz.totalMarks;
//         existingAttempt.attemptedAt = new Date();
//         await existingAttempt.save();

//         return res.status(200).json({
//           message: 'Quiz reattempt recorded — new higher score updated!',
//           score,
//           totalMarks: quiz.totalMarks,
//           detailedAnswers,
//           questions: quiz.questions,
//         });
//       } else {
//         // Keep old score if new one is not higher
//         return res.status(200).json({
//           message: 'Quiz already attempted — new score is lower, so not updated.',
//           previousScore: existingAttempt.score,
//           newScore: score,
//           totalMarks: quiz.totalMarks,
//           detailedAnswers: existingAttempt.answers,
//           questions: quiz.questions,
//         });
//       }
//     }

//     // Create a new attempt if user is attempting for the first time
//     await QuizAttemptModel.create({
//       userId,
//       quizId,
//       answers: detailedAnswers,
//       score,
//       totalMarks: quiz.totalMarks,
//     });

//     res.status(200).json({
//       message: 'Quiz submitted successfully',
//       score,
//       totalMarks: quiz.totalMarks,
//       detailedAnswers,
//       questions: quiz.questions,
//     });
//   } catch (error) {
//     console.error('Error submitting quiz:', error);
//     res.status(500).json({ message: 'Error submitting quiz', error });
//   }
// };

export const getUserQuizHistory = async (req, res) => {
  try {
    const attempts = await QuizAttemptModel.find({ userId: req.user._id }).sort({ attemptedAt: -1 }).limit(50); // paginate
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz history', error });
  }
};

export const getUserQuizAttempts = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware

    // console.log('userId', userId);

    // Fetch all attempts by the user
    const attempts = await QuizAttemptModel.find({ userId }).lean();
    // console.log('attempts', attempts);

    // Optionally, include quiz title and question details
    const detailedAttempts = await Promise.all(
      attempts.map(async (attempt) => {
        // console.log('attempt', attempt);

        const quiz = await quizModel.findOne({ id: attempt.quizId }).lean();
        if (!quiz) return attempt;
        // console.log('quiz', quiz);

        return {
          userId: attempt.userId,
          id: attempt._id,
          quizId: attempt.quizId,
          quizTitle: quiz.title,
          score: attempt.score,
          totalMarks: attempt.totalMarks,
          attemptedAt: attempt.attemptedAt,
          answers: attempt.answers.map((a) => {
            const q = quiz.questions.find((q) => q.id === a.questionId);
            return {
              question: q ? q.question : 'Question not found',
              options: q ? q.options : [],
              selectedIndex: a.selectedIndex,
              correctAnswerIndex: a.correctAnswerIndex,
              isCorrect: a.isCorrect,
              questionId: a.questionId,
            };
          }),
        };
      }),
    );

    res.status(200).json({
      totalAttempts: detailedAttempts.length,
      attempts: detailedAttempts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching quiz attempts', error });
  }
};
