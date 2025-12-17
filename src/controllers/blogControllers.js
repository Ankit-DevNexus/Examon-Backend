import dotenv from 'dotenv';
dotenv.config();
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import mongoose from 'mongoose';
import blogModel from '../models/blogModel.js';

// console.log('Cloudinary config:', {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
// });

export const BlogController = async (req, res) => {
  try {
    console.log('BlogController payload');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const { title, blogContent } = req.body;
    const featuredImagePath = req.file?.path;

    if (!blogContent || !title || !featuredImagePath) {
      return res.status(400).json({
        message: 'Missing title, content, or image file',
        received: { featuredImagePath, title, blogContent },
      });
    }

    const BlogFeaturedImage = req.file?.path;

    if (!BlogFeaturedImage) {
      return res.status(400).json({
        success: false,
        message: 'Blog image is missing',
      });
    }

    let uploadedImage;
    try {
      uploadedImage = await uploadOnCloudinary(BlogFeaturedImage, 'course_images');

      console.log('Upload Image', uploadedImage);
    } catch (error) {
      console.log('Error uploading image to cloudinary', error);
      return res.status(500).json({ success: false, message: 'Error uploading image to cloudinary' });
    }
    const newBlog = new blogModel({
      title,
      blogContent,
      featuredImage: uploadedImage.url,
      publicId: uploadedImage.public_id,
    });

    await newBlog.save();
    res.status(201).json({ message: 'Blog saved successfully!' });
  } catch (err) {
    console.error('Full error details:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const AllBlogController = async (req, res) => {
  try {
    const blogs = await blogModel.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

// GET /api/blogs/:id
export const getBlogByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the id string
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    //  Look up the blog
    const blog = await blogModel.findById(id);

    //  Handle “not found”
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Return the blog
    res.status(200).json(blog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching blog' });
  }
};

// export const BlogImageController = async (req, res) => {
//   try {
//     const localPath = req.file?.path;
//     console.log('localPath', localPath);

//     // Upload to Cloudinary
//     const uploadedImage = await uploadOnCloudinary(localPath, 'blog_images');
//     if (!uploadedImage) {
//       return res.status(500).json({ success: false, message: 'Image upload failed' });
//     }

//     res.status(200).json({ url: result.url });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Image upload failed' });
//   }
// };

export const EditBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, blogContent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    const existingBlog = await blogModel.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    console.log('Uploaded File:', req.file);

    const updateFields = {};
    if (title?.trim()) updateFields.title = title.trim();
    if (blogContent?.trim()) updateFields.blogContent = blogContent.trim();

    if (req.file) {
      const newImagePath = req.file.path;

      // Delete old image from Cloudinary (if exists)
      if (existingBlog.publicId) {
        try {
          await cloudinary.uploader.destroy(existingBlog.publicId);
        } catch (cloudErr) {
          console.error('Error deleting old image from Cloudinary:', cloudErr.message);
        }
      }

      // Upload new image to Cloudinary
      const uploadedImage = await uploadOnCloudinary(newImagePath);
      if (uploadedImage) {
        updateFields.featuredImage = uploadedImage.url;
        updateFields.publicId = uploadedImage.public_id;
      }
    }

    const updatedBlog = await blogModel.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updatedBlog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      updatedBlog,
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const DeleteBlogController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog ID' });
    }

    const blog = await blogModel.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.featuredImage) {
      try {
        const urlParts = blog.featuredImage.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const publicId = `blogs/${fileName.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted Cloudinary image: ${publicId}`);
      } catch (err) {
        console.warn('Failed to delete Cloudinary image:', err.message);
      }
    }

    await blogModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
