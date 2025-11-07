import mongoose from 'mongoose';

const BlogsSchema = new mongoose.Schema(
  {
    featuredImage: {
      type: String,
    },
    title: {
      type: String,
    },
    blogContent: {
      type: String,
      required: true,
    },
    publicId: { type: String },
  },
  {
    timestamps: true,
  },
);

const blogModel = mongoose.model('blogModel', BlogsSchema);

export default blogModel;
