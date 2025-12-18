import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String  },
    blogContent: { type: String },
    featuredImage: { type: String  },
    publicId: { type: String  },
    resourceType: { type: String },
  },
  { timestamps: true }
);

const blogCategorySchema = new mongoose.Schema(
  {
    blogCategory: {
      type: String,
      
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
