import mongoose from 'mongoose';

const ImageContentSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // actual name of model
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subTitle1: {
      type: String,
      trim: true,
    },
    subTitle2: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const latestNewModel = mongoose.model('ImageContent', ImageContentSchema);
export default latestNewModel;
