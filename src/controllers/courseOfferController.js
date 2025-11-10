import CourseOfferModel from '../models/CourseOfferModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { notifySubscribers } from '../utils/notifySubscribers.js';

//  CREATE
export const createCourseOffer = async (req, res) => {
  try {
    const { examCategory, title, insideCourses, actualprice, previousprice, percent, description, perks, Discount, amount } = req.body;

    // Validate image
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    // Upload to Cloudinary
    const uploadedImage = await uploadOnCloudinary(req.file.path, 'course_images');
    if (!uploadedImage) {
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }

    //Find or create the category document
    let existingCategory = await CourseOfferModel.findOne({ examCategory: examCategory });
    if (!existingCategory) {
      existingCategory = new CourseOfferModel({ examCategory: examCategory, courses: [] });
    }

    //  Push new course inside that category
    existingCategory.courses.push({
      img: uploadedImage.url,
      publicId: uploadedImage.public_id || '',
      clientId: req.user._id,
      examCategory,
      title,
      insideCourses: insideCourses?.split(',').map((i) => i.trim()) || [],
      actualprice: Number(actualprice),
      previousprice: Number(previousprice),
      percent: Number(percent),
      description,
      perks: perks?.split(',').map((i) => i.trim()) || [],
      Discount: Discount === 'true',
      amount: Number(amount),
    });

    const saved = await existingCategory.save();

    // send notifications
    await notifySubscribers('Course', title, description, 'http://localhost:3004/api/course/all');

    res.status(201).json({
      success: true,
      message: `Course "${title}" added successfully under category "${examCategory}"`,
      data: saved,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating course.',
      error: error.message,
    });
  }
};

// READ all

export const getAllCourseOffers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const match = search ? { examCategory: { $regex: search, $options: 'i' } } : {};

    const total = await CourseOfferModel.countDocuments(match);

    const offers = await CourseOfferModel.find(match)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Courses fetched successfully',
      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limitPerPage: limit,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching.',
      error: error.message,
    });
  }
};

// READ Single
// export const getCourseOfferById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const offer = await CourseOfferModel.findById(id);

//     if (!offer) {
//       return res.status(404).json({
//         success: false,
//         message: 'Course not found.',
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: offer,
//     });
//   } catch (error) {
//     console.error('Error fetching course:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching course.',
//       error: error.message,
//     });
//   }
// };

export const getCourseOfferById = async (req, res) => {
  try {
    const { categoryId, courseId } = req.params;

    const category = await CourseOfferModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const course = category.courses.id(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course',
      error: error.message,
    });
  }
};

//  UPDATE
// export const updateCourseOffer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = { ...req.body };

//     // Check if course exists
//     const existingCourse = await CourseOfferModel.findById(id);
//     if (!existingCourse) {
//       return res.status(404).json({
//         success: false,
//         message: 'Course not found',
//       });
//     }

//     // Handle new image upload (optional)
//     if (req.file) {
//       try {
//         // Delete old image from Cloudinary
//         if (existingCourse.publicId) {
//           await cloudinary.uploader.destroy(existingCourse.publicId);
//         }

//         // Upload new image
//         const uploaded = await uploadOnCloudinary(req.file.path);
//         updateData.img = uploaded.url;
//         updateData.publicId = uploaded.public_id;
//       } catch (err) {
//         console.error('Error uploading new image:', err);
//         return res.status(500).json({
//           success: false,
//           message: 'Error uploading new image',
//           error: err.message,
//         });
//       }
//     }

//     // Update course document
//     const updatedCourse = await CourseOfferModel.findByIdAndUpdate(id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Course updated successfully',
//       data: updatedCourse,
//     });
//   } catch (error) {
//     console.error('Error updating course:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating course',
//       error: error.message,
//     });
//   }
// };
export const updateCourseOffer = async (req, res) => {
  try {
    const { categoryId, courseId } = req.params;
    const updateData = { ...req.body };

    // Find the category document
    const category = await CourseOfferModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Find the course inside the category
    const course = category.courses.id(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Handle new image upload (optional)
    if (req.file) {
      if (course.publicId) {
        await cloudinary.uploader.destroy(course.publicId);
      }
      const uploaded = await uploadOnCloudinary(req.file.path);
      updateData.img = uploaded.url;
      updateData.publicId = uploaded.public_id;
    }

    // Update course fields dynamically
    Object.keys(updateData).forEach((key) => {
      course[key] = updateData[key];
    });

    // Important: tell Mongoose that subdocument was modified
    category.markModified('courses');

    // Save the category document
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating course',
      error: error.message,
    });
  }
};

// DELETE
export const deleteCourseOffer = async (req, res) => {
  try {
    const { categoryId, courseId } = req.params;

    // Find the category
    const category = await CourseOfferModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Find the course inside the category
    const course = category.courses.id(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Delete image from Cloudinary (if exists)
    if (course.publicId) {
      await cloudinary.uploader.destroy(course.publicId);
    }

    //  Remove the course from array
    category.courses.pull({ _id: courseId });

    // Save category after deletion
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting course',
      error: error.message,
    });
  }
};

// export const deleteCourseOffer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const existing = await CourseOfferModel.findById(id);

//     if (!existing) {
//       return res.status(404).json({ success: false, message: 'Course not found' });
//     }

//     if (existing.publicId) {
//       try {
//         await cloudinary.uploader.destroy(existing.publicId);
//       } catch (err) {
//         console.error('Error deleting image from Cloudinary:', err);
//       }
//     }

//     await CourseOfferModel.findByIdAndDelete(id);

//     res.status(200).json({
//       success: true,
//       message: 'Course deleted successfully',
//     });
//   } catch (error) {
//     console.error('Error deleting course:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while deleting course',
//       error: error.message,
//     });
//   }
// };
