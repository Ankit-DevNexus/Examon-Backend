import achievementModel from '../models/achievementBarModel.js';

// Create
export const createAchievement = async (req, res) => {
  try {
    const { activeUser, satisfyUser, courses, passingRate, Instructors, alumni } = req.body;
    // console.log("Received Data:", req.body);

    const newAchievement = new achievementModel({
      activeUser,
      satisfyUser,
      courses,
      passingRate,
      Instructors,
      alumni,
    });

    const achievementAdded = await newAchievement.save();

    res.status(201).json({
      success: true,
      message: 'created successfully!',
      data: achievementAdded,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Read all
export const getAllAchievement = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await achievementModel.countDocuments();

    const achievements = await achievementModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!achievements || achievements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No achievements found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Achievements fetched successfully.',

      totalRecords: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limitPerPage: limit,
      data: achievements,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements.',
      error: error.message,
    });
  }
};

// Read one
export const getAchievementById = async (req, res) => {
  try {
    const achievement = await achievementModel.findById(req.params.id);
    if (!achievement) return res.status(404).json({ error: 'achievement not found' });
    res.status(200).json(achievement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
export const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Received ID:', id);
    // console.log('Update Data:', updateData);

    const updatedAchievement = await achievementModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    if (!updatedAchievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Achievement updated successfully',
      data: updatedAchievement,
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update achievement',
      error: error.message,
    });
  }
};

// Delete
export const deleteAchievement = async (req, res) => {
  try {
    const achievement = await achievementModel.findByIdAndDelete(req.params.id);
    if (!achievement) return res.status(404).json({ error: 'achievement not found' });
    res.status(200).json({ message: 'achievement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
