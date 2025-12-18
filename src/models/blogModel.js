import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    blogContent: { type: String, required: true },
    featuredImage: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String },
  },
  { timestamps: true }
);

const blogCategorySchema = new mongoose.Schema(
  {
    blogCategory: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    blogs: [blogSchema],
  },
  { timestamps: true }
);

const blogModel = mongoose.model('BlogCategory', blogCategorySchema);
export default blogModel;
