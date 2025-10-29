import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    activeUser: {
      type: Number,
      required: true,
    },
    satisfyUser: {
      type: String,
      required: true,
    },
    courses: {
      type: Number,
      required: true,
    },
    passingRate: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const achievementModel = mongoose.model('achievementCollection', achievementSchema);

export default achievementModel;
