import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    activeUser: {
      type: String,
    },
    satisfyUser: {
      type: String,
    },
    courses: {
      type: String,
    },
    passingRate: {
      type: String,
    },
    Instructors: {
      type: String,
    },
    alumni: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const achievementModel = mongoose.model('achievementCollection', achievementSchema);

export default achievementModel;
