import express from 'express';
import { deleteUsers, getAllUsers, login, logout, signup } from '../controllers/userController.js';
import { ContactUsController, getAllContacts } from '../controllers/contactusController.js';
import upload from '../middleware/multerMiddleware.js';
import { createReview, deleteReview, getAllReview, getAllReviewById, updateReview } from '../controllers/reviewController.js';
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
  deleteCourseCategory,
  deleteCourseOffer,
  getAllCourseOffers,
  getCourseOfferById,
  updateCourseOffer,
} from '../controllers/courseOfferController.js';
import { deleteSubscriber, getAllSubscriber, subscribeNewsletter } from '../controllers/newsletterController.js';
import {
  deleteQuiz,
  getAllQuizzes,
  getAttemptsByUserId,
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
  deleteBatchInsideCategory,
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
  deleteCategoryAndExamsDetails,
  deleteExamDetailsInsideCategory,
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
import { getProfileByUserId, updateProfile } from '../controllers/profileController.js';
import { changePasswordController } from '../controllers/changePasswordController.js';
import { globalSearch } from '../controllers/globalSearchController.js';
import { resendOTP, verifyOTP } from '../controllers/verifyOTPController.js';
import {
  // deleteHomePageQuiz,
  deleteHomePageQuizCategory,
  getAllHomePageQuizzes,
  getHomePageQuizById,
  updateHomePageQuiz,
  uploadHomePageQuiz,
} from '../controllers/quizHomePageController.js';
import {
  createNotification,
  deleteNotification,
  getLatestNotification,
  updateNotification,
} from '../controllers/notificationController.js';
import {
  deleteDiscountNotification,
  getLatestDiscountNotification,
  notificationOfferController,
} from '../controllers/notificationOfferController.js';

const router = express.Router();

// Admin
router.post('/admin/signup', adminSignup);
router.post('/admin/signin', adminLogin);
router.post('/logout', Authenticate, logout);

// ---------------- OTP verification ---------------------------

router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// client (users)
router.post('/signup', signup);
router.post('/signin', login);
router.delete('/delete', Authenticate, authorize('admin'), deleteUsers);
router.patch('/profile/update/:userId', Authenticate, authorize('user'), upload.single('profileImage'), updateProfile);
router.get('/profile/:userId', Authenticate, getProfileByUserId);

// all users
router.get('/users/all', Authenticate, getAllUsers);

// ---------------- change password ---------------------------
router.patch('/change-password', Authenticate, changePasswordController);

// --------------------------- contact us  ----------------------------
router.post('/contact-us', ContactUsController);
router.get('/contact-us', getAllContacts);

// --------------------------- Search  ----------------------------
router.get('/search', globalSearch);

// --------------------------- Review  ----------------------------

router.post('/review/create', upload.single('profilePicture'), Authenticate, createReview);
router.get('/review/get', getAllReview);
router.get('/review/:userId', getAllReviewById); // get review by UserId
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
router.delete('/course/delete/:categoryId', Authenticate, authorize('admin'), deleteCourseCategory);
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

router.get('/user/quizzes/:userId', Authenticate, getAttemptsByUserId); // get attempted quizzes by user ID who is logged in

router.get('/attempted/quizzes', Authenticate, getUserQuizHistory);
router.get('/user/attempts', Authenticate, authorize('user'), getUserQuizAttempts);

// --------------------------- Home page Quiz ----------------------------

// Admin route to upload quiz
router.post('/home/quizzes/upload', Authenticate, authorize('admin'), uploadHomePageQuiz);

// Public routes
router.get('/home/quizzes', getAllHomePageQuizzes);
router.get('/home/quizzes/:id', getHomePageQuizById);
router.patch('/home/quizzes/update/:id', Authenticate, authorize('admin'), updateHomePageQuiz);
router.delete('/home/quizzes/delete/:quizId', Authenticate, authorize('admin'), deleteHomePageQuizCategory);
// router.delete('/home/quizzes/:categoryId/:examId', Authenticate, authorize('admin'), deleteHomePageQuiz);

// ------------------------ Study material - Exam notes ---------------------------

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
router.delete('/live/batches/delete/:categoryId/:batchId', Authenticate, authorize('admin'), deleteBatchInsideCategory); // delete batch
router.delete('/live/category/delete/:categoryId', Authenticate, authorize('admin'), deleteCategory); // delete category

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
router.get('/exams/details/:categoryId/:examId', getExamDetailsById);
router.patch('/exams/details/update/:categoryId/:detailId', Authenticate, upload.single('upload'), updateExamDetails);
router.delete('/exams/details/delete/:categoryId', Authenticate, deleteCategoryAndExamsDetails);
router.delete('/exams/details/delete/:categoryId/:examId', Authenticate, deleteExamDetailsInsideCategory);

// ------------------------------------ Blog ------------------------------------

// router.post('/upload-image', upload.single('upload'), BlogImageController);
router.post('/create-blogs', Authenticate, upload.single('featuredImage'), BlogController);
router.get('/blogs', AllBlogController);
router.get('/blogs/:id', getBlogByIdController);
router.patch('/blogs/update/:id', Authenticate, upload.single('featuredImage'), EditBlogController);
router.delete('/blogs/delete/:id', Authenticate, DeleteBlogController);

// ------------------------------------ total count ------------------------------------
router.get('/totalcount', totalCountController);

// ------------------------------------ Notification ------------------------------------
router.post('/notification/create', Authenticate, upload.single('image'), createNotification);
router.get('/notification/latest', getLatestNotification);
router.put('/notification/:id', upload.single('image'), updateNotification);
router.delete('/notification/delete/:id', Authenticate, deleteNotification);

// ------------------------------------ Offer Notification ------------------------------------

router.post('/notifications/push', Authenticate, notificationOfferController);
router.get('/notifications/discount/latest', getLatestDiscountNotification);
router.delete('/notification/discount/delete/:id', Authenticate, deleteDiscountNotification);

export default router;
