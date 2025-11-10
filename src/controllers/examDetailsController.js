import mongoose from 'mongoose';
import ExamModel from '../models/examDetailsModel.js';

// Create Exam
export const createExamDetails = async (req, res) => {
  try {
    // console.log('req.body:', req.body);
    // console.log('req.file:', req.file);

    const { title, Content } = req.body;
    console.log('req.body', req.body);

    // const featuredImagePath = req.file?.path;

    if (!Content || !title) {
      return res.status(400).json({
        message: 'Missing title, content, or image file',
        received: { title, Content },
      });
    }

    // const FeaturedImage = req.file?.path;

    // let uploadedImage;
    // if (FeaturedImage) {
    //   try {
    //     uploadedImage = await uploadOnCloudinary(FeaturedImage);
    //     console.log('Upload Image', uploadedImage);
    //   } catch (error) {
    //     console.log('Error uploading image to cloudinary', error);
    //     return res.status(500).json({ success: false, message: 'Error uploading image to cloudinary' });
    //   }
    // }
    const newcontent = new ExamModel({
      title,
      Content,
      // featuredImage: uploadedImage?.secure_url || '',
      // publicId: uploadedImage.public_id,
    });

    await newcontent.save();
    res.status(201).json({ message: 'saved successfully!' });
  } catch (err) {
    console.error('Full error details:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const uploadImageController = async (req, res) => {
  try {
    const localPath = req.file?.path;
    console.log('localPath', localPath);

    // Upload to Cloudinary
    const uploadedImage = await uploadOnCloudinary(localPath, 'Exam_Details_images');
    if (!uploadedImage) {
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }

    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

// Get All Exams
export const getAllExamsDetails = async (req, res) => {
  try {
    const exams = await ExamModel.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch exams' });
  }
};

//  Get Exam by ID
export const getExamDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the id string
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const exam = await ExamModel.findById(id);

    //  Handle “not found”
    if (!exam) {
      return res.status(404).json({ message: 'Not found' });
    }

    // Return the exam
    res.status(200).json(exam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching' });
  }
};

//  Update Exam
export const updateExamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, Content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid exam ID' });
    }

    const exam = await ExamModel.findById(id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'exam not found' });
    }
    console.log('Uploaded File:', req.file);

    const updateFields = {};
    if (title?.trim()) updateFields.title = title.trim();
    if (Content?.trim()) updateFields.Content = Content.trim();

    // if (Object.keys(updateFields).length === 0) {
    //   return res.status(400).json({ success: false, message: "No valid fields to update" });
    // }

    if (req.file) {
      const newImagePath = req.file.path;

      // Delete old image from Cloudinary if exists
      if (exam.featuredImage) {
        try {
          const urlParts = exam.featuredImage.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const publicId = `exams/${fileName.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
          console.log(`Old image deleted from Cloudinary: ${publicId}`);
        } catch (err) {
          console.warn('Failed to delete old Cloudinary image:', err.message);
        }
      }

      // Upload new image to Cloudinary
      const uploadedImage = await cloudinary.uploader.upload(newImagePath, 'Exam_Details_images');

      updateFields.featuredImage = uploadedImage.secure_url;

      // Delete local file
      fs.unlinkSync(newImagePath);
    }

    const updatedexam = await ExamModel.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedexam) {
      return res.status(404).json({ success: false, message: 'exam not found' });
    }

    res.status(200).json({
      success: true,
      message: 'exam updated successfully',
      updatedexam,
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

//  Delete Exam
export const deleteExamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid exam ID' });
    }

    const exam = await ExamModel.findById(id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'exam not found' });
    }

    if (exam.featuredImage) {
      try {
        const urlParts = exam.featuredImage.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `exams/${fileName.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted Cloudinary image: ${publicId}`);
      } catch (err) {
        console.warn('Failed to delete Cloudinary image:', err.message);
      }
    }

    await ExamModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'exam deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// import ExamModel from '../models/examDetailsModel.js';

// // Create Exam
// export const createExamDetails = async (req, res) => {
//   try {
//     const exam = await ExamModel.create(req.body);
//     res.status(201).json({ success: true, message: 'Exam created successfully', data: exam });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error creating exam', error: error.message });
//   }
// };

// // Get All Exams
// export const getAllExamsDetails = async (req, res) => {
//   try {
//     // Extract pagination parameters from query
//     const page = parseInt(req.query.page) || 1; // default page 1
//     const limit = parseInt(req.query.limit) || 10; // default 10 per page

//     // Calculate skip value
//     const skip = (page - 1) * limit;

//     // Fetch exams with pagination
//     const exams = await ExamModel.find().skip(skip).limit(limit);

//     // Count total documents for total pages
//     const total = await ExamModel.countDocuments();

//     res.status(200).json({
//       success: true,
//       currentPage: page,
//       totalPages: Math.ceil(total / limit),
//       totalCount: total,
//       data: exams,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching exams',
//       error: error.message,
//     });
//   }
// };

// //  Get Exam by ID
// export const getExamDetailsById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const exam = await ExamModel.findById(id);
//     if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
//     res.status(200).json({ success: true, data: exam });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching exam', error: error.message });
//   }
// };

// //  Update Exam
// export const updateExamDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updated = await ExamModel.findByIdAndUpdate(id, req.body, { new: true });

//     if (!updated) return res.status(404).json({ success: false, message: 'Exam not found' });

//     res.status(200).json({
//       success: true,
//       message: 'Exam updated successfully',
//       data: updated,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error updating exam',
//       error: error.message,
//     });
//   }
// };

// //  Delete Exam
// export const deleteExamDetails = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await ExamModel.findByIdAndDelete(id);

//     if (!deleted) return res.status(404).json({ success: false, message: 'Exam not found' });

//     res.status(200).json({ success: true, message: 'Exam deleted successfully' });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting exam',
//       error: error.message,
//     });
//   }
// };
