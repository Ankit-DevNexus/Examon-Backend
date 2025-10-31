import mongoose from 'mongoose';
import { type } from 'os';

const achievementSchema = new mongoose.Schema(
  {
    activeUser: {
      type: Number,
    },
    satisfyUser: {
      type: String,
    },
    courses: {
      type: Number,
    },
    passingRate: {
      type: Number,
    },
    Instructors: {
      type: Number,
    },
    alumni: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const achievementModel = mongoose.model('achievementCollection', achievementSchema);

export default achievementModel;
