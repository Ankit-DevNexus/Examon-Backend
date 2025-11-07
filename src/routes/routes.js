import express from 'express';
import { deleteUsers, login, logout, signup } from '../controllers/userController.js';
import { ContactUsController } from '../controllers/contactusController.js';
import upload from '../middleware/multerMiddleware.js';
import { createReview, deleteReview, getAllReview, updateReview } from '../controllers/reviewController.js';
import { Authenticate, authorize } from '../middleware/authMiddleware.js';
import {
  createAchievement,
  deleteAchievement,
  getAchievementById,
  getAllAchievement,
  updateAchievement,
} from '../controllers/achievementBarController.js';
import { adminLogin, adminSignup } from '../controllers/adminController.js';
import {
  createImageContent,
  deleteImageContent,
  getAllImageContents,
  getImageContentById,
  updateImageContent,
} from '../controllers/latestNewsController.js';
import {
  createCourseOffer,
  deleteCourseOffer,
  getAllCourseOffers,
  getCourseOfferById,
  updateCourseOffer,
} from '../controllers/courseOfferController.js';
import { deleteSubscriber, getAllSubscriber, subscribeNewsletter } from '../controllers/newsletterController.js';
import {
  deleteQuiz,
  getAllQuizzes,
  getQuizById,
  getUserQuizAttempts,
  getUserQuizHistory,
  submitQuiz,
  updateQuiz,
  uploadQuiz,
} from '../controllers/quizController.js';
import {
  createExamNotes,
  deleteExamNotes,
  getAllExamNotes,
  getExamNotesById,
  updateExamNotes,
} from '../controllers/examNotesController.js';
import {
  addBatchToCategory,
  deleteBatch,
  deleteCategory,
  getAllCategories,
  getBatchesByCategory,
  getSingleBatch,
  updateBatch,
} from '../controllers/liveBatchController.js';
import {
  addQuestionPaper,
  deletePYQCategory,
  deleteQuestionPaper,
  getAllPYQs,
  getPYQByCategory,
  getPYQByPaperId,
  updateQuestionPaper,
} from '../controllers/pyqController.js';
import {
  createInstructor,
  deleteInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructor,
} from '../controllers/instructorController.js';
import {
  createExamDetails,
  deleteExamDetails,
  getAllExamsDetails,
  getExamDetailsById,
  updateExamDetails,
  uploadImageController,
} from '../controllers/examDetailsController.js';
import {
  AllBlogController,
  BlogController,
  DeleteBlogController,
  EditBlogController,
  getBlogByIdController,
} from '../controllers/blogControllers.js';
import { totalCountController } from '../controllers/AllRecordsController.js';

const router = express.Router();

// Admin
router.post('/admin/signup', adminSignup);
router.post('/admin/signin', adminLogin);
router.post('/logout', Authenticate, logout);

// client (users)
router.post('/signup', signup);
router.post('/signin', login);
router.delete('/delete', Authenticate, authorize('admin'), deleteUsers);

// --------------------------- contact us  ----------------------------
router.post('/contact-us', ContactUsController);

// --------------------------- Review  ----------------------------

router.post('/review/create', upload.single('profilePicture'), Authenticate, createReview);
router.get('/review/get', getAllReview);
router.patch('/review/update/:id', upload.single('profilePicture'), Authenticate, updateReview);
router.delete('/review/delete/:id', Authenticate, deleteReview);

// --------------------------- Achievement bar ----------------------------
router.post('/achievement/create', Authenticate, authorize('admin'), createAchievement);
router.get('/achievement/get', getAllAchievement);
router.get('/achievement/:id', getAchievementById);
router.patch('/achievement/update/:id', Authenticate, authorize('admin'), updateAchievement);
router.delete('/achievement/delete/:id', Authenticate, authorize('admin'), deleteAchievement);

// --------------------------- latest news ----------------------------

router.post('/news/create', Authenticate, authorize('admin'), upload.single('image'), createImageContent);
router.get('/news/all', getAllImageContents);
router.get('/news/:id', getImageContentById);
router.patch('/news/update/:id', Authenticate, authorize('admin'), upload.single('image'), updateImageContent);
router.delete('/news/delete/:id', Authenticate, authorize('admin'), deleteImageContent);

// --------------------------- Courses ----------------------------

router.post('/course/create', Authenticate, authorize('admin'), upload.single('img'), createCourseOffer);
router.get('/course/all', getAllCourseOffers);
router.get('/course/:categoryId/:courseId', getCourseOfferById);
router.patch('/course/update/:categoryId/:courseId', Authenticate, authorize('admin'), upload.single('img'), updateCourseOffer);
router.delete('/course/delete/:categoryId/:courseId', Authenticate, authorize('admin'), deleteCourseOffer);

// --------------------------- Newslettter ----------------------------
router.post('/subscribe', subscribeNewsletter);
router.get('/subscribe', Authenticate, getAllSubscriber);
router.delete('/subscribe', Authenticate, deleteSubscriber);

// --------------------------- Quiz ----------------------------

// Admin route to upload quiz
router.post('/quizzes/upload', Authenticate, authorize('admin'), uploadQuiz);

// Public routes
router.get('/quizzes', getAllQuizzes);
router.get('/quizzes/:id', getQuizById);
router.patch('/quizzes/:id', Authenticate, authorize('admin'), updateQuiz);
router.delete('/quizzes/:id', Authenticate, authorize('admin'), deleteQuiz);
router.post('/quizzes/:id/submit', Authenticate, submitQuiz);
// router.post('/quizzes/:id/submit', Authenticate, authorize('user'), submitQuiz);

router.get('/profile/quizzes', Authenticate, authorize('user'), getUserQuizHistory);
router.get('/user/attempts', Authenticate, authorize('user'), getUserQuizAttempts);

// ------------------------Study material - Exam notes ---------------------------

router.post('/notes/add', Authenticate, authorize('admin'), upload.single('notes'), createExamNotes);
router.get('/notes/all', getAllExamNotes);
router.get('/notes/:categoryId/:noteId', getExamNotesById);
router.patch('/notes/updates/:categoryId/:noteId', updateExamNotes);
router.delete('/notes/delete/:categoryId/:noteId', deleteExamNotes);

// ------------------------------------ Live batches ------------------------------------
// ROUTES
router.post('/live/batches', Authenticate, upload.single('image'), addBatchToCategory); // add batch (and upload image)
router.get('/live/batches', getAllCategories); // get all categories
router.get('/live/batches/:categoryId', getBatchesByCategory); // get one category’s batches
router.get('/live/batches/:categoryId/:batchId', getSingleBatch); // get one category’s batches
router.patch('/live/batches/update/:categoryId/:batchId', Authenticate, authorize('admin'), upload.single('image'), updateBatch); // update batch
router.delete('/live/batches/delete/:categoryId/:batchId', Authenticate, authorize('admin'), deleteBatch); // delete batch
router.delete('/live/batches/delete/:categoryId', Authenticate, authorize('admin'), deleteCategory); // delete category

// ------------------------------------ PYQ ------------------------------------

// Routes
router.post('/pyq/add', Authenticate, authorize('admin'), upload.single('pdf'), addQuestionPaper);
router.get('/pyq/', getAllPYQs);
router.get('/pyq/:categoryId', getPYQByCategory);
router.get('/pyq/:categoryId/:paperId', getPYQByPaperId);
router.patch('/pyq/update/:categoryId/:paperId', Authenticate, authorize('admin'), upload.single('pdf'), updateQuestionPaper);
router.delete('/pyq/delete/:categoryId/:paperId', deleteQuestionPaper);
router.delete('/pyq/delete/:categoryId', deletePYQCategory);

// ------------------------------------ Mentors/instructor ------------------------------------

router.post('/mentors/create', Authenticate, upload.single('image'), createInstructor);
router.get('/mentors', getAllInstructors);
router.get('/mentors/:id', getInstructorById);
router.patch('/mentors/update/:id', Authenticate, upload.single('image'), updateInstructor);
router.delete('/mentors/delete/:id', Authenticate, deleteInstructor);

// ------------------------------------ exam details ------------------------------------

router.post('/upload-image', upload.single('upload'), uploadImageController);
router.post('/exams/details', upload.none(), Authenticate, createExamDetails);
router.get('/exams/details', getAllExamsDetails);
router.get('/exams/details/:id', getExamDetailsById);
router.patch('/exams/details/update/:id', Authenticate, updateExamDetails);
router.delete('/exams/details/delete/:id', Authenticate, deleteExamDetails);

// ------------------------------------ Blog ------------------------------------

// router.post('/upload-image', upload.single('upload'), BlogImageController);
router.post('/create-blogs', Authenticate, upload.single('featuredImage'), BlogController);
router.get('/blogs', AllBlogController);
router.get('/blogs/:id', getBlogByIdController);
router.get('/blogs/update/:id', Authenticate, EditBlogController);
router.get('/blogs/delete/:id', Authenticate, DeleteBlogController);

// ------------------------------------ total count  ------------------------------------

router.get('/totalcount', totalCountController);
export default router;
