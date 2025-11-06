import mongoose from 'mongoose';

// single course inside a category
const CourseSchema = new mongoose.Schema(
  {
    img: { type: String },
    publicId: { type: String }, // Cloudinary public ID
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    title: { type: String, trim: true },
    insideCourses: { type: [String], default: [] },
    actualprice: { type: Number },
    previousprice: { type: Number },
    percent: { type: Number },
    description: { type: String, default: '' },
    perks: { type: [String], default: [] },
    Discount: { type: Boolean, default: false },
    amount: { type: Number },
  },
  { timestamps: true },
);

// category that holds many courses
const CategorySchema = new mongoose.Schema(
  {
    examCategory: { type: String, unique: true, lowercase: true },
    courses: [CourseSchema],
  },
  { timestamps: true },
);

const CourseOfferModel = mongoose.model('CourseOffer', CategorySchema);
export default CourseOfferModel;
