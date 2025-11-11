import InstructorModel from '../models/instructorModel.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';

// Create Instructor
export const createInstructor = async (req, res) => {
  try {
    const { name, subjectTaught, experience, CoursesHandled, specialization, description, youtubeLink, coursesLink } = req.body;
    // console.log('req.body', req.body);

    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });

    // Upload to Cloudinary
    const uploadResponse = await uploadOnCloudinary(req.file.path, 'instructors');

    const instructor = await InstructorModel.create({
      imageUrl: uploadResponse.url,
      publicId: uploadResponse.public_id,
      name,
      subjectTaught,
      experience,
      CoursesHandled,
      specialization,
      description,
      youtubeLink,
      coursesLink,
    });

    res.status(201).json({ success: true, data: instructor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating instructor', error: error.message });
  }
};

// Get all Instructors
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await InstructorModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: instructors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching instructors', error: error.message });
  }
};

// Get single Instructor by ID
export const getInstructorById = async (req, res) => {
  try {
    const instructor = await InstructorModel.findById(req.params.id);
    if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found' });
    res.status(200).json({ success: true, data: instructor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching instructor', error: error.message });
  }
};

// Update Instructor
export const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await InstructorModel.findById(id);
    if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found' });

    let imageUrl = instructor.imageUrl;
    let publicId = instructor.publicId;

    if (req.file) {
      // Delete old image
      await deleteFromCloudinary(publicId);
      // Upload new one
      const uploadResponse = await uploadOnCloudinary(req.file.path, 'instructors');
      imageUrl = uploadResponse.secure_url;
      publicId = uploadResponse.public_id;
    }

    const updated = await InstructorModel.findByIdAndUpdate(id, { ...req.body, imageUrl, publicId }, { new: true });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating instructor', error: error.message });
  }
};

// Delete Instructor
export const deleteInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await InstructorModel.findById(id);
    if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found' });

    await deleteFromCloudinary(instructor.publicId);
    await instructor.deleteOne();

    res.status(200).json({ success: true, message: 'Instructor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting instructor', error: error.message });
  }
};
