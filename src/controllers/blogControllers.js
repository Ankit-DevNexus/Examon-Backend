import dotenv from 'dotenv';
dotenv.config();
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import blogModel from '../models/blogModel.js';

export const BlogController = async (req, res) => {
  try {
    const { title, blogContent, blogCategory } = req.body;

    console.log('BlogController payload');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    
    if (!title || !blogContent || !blogCategory) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Upload image
    const uploadedImage = await uploadOnCloudinary(req.file.path, 'blogs_images');

    // Find or create category
    let categoryDoc = await blogModel.findOne({ blogCategory });

    const blogData = {
      title,
      blogContent,
      featuredImage: uploadedImage.url,
      publicId: uploadedImage.public_id,
      resourceType: uploadedImage.resource_type,
    };

    if (!categoryDoc) {
      categoryDoc = await blogModel.create({
        blogCategory,
        blogs: [blogData],
      });
    } else {
      categoryDoc.blogs.push(blogData);
      await categoryDoc.save();
    }

    res.status(201).json({
      success: true,
      message: 'Blog added successfully',
      categoryDoc
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const AllBlogController = async (req, res) => {
  try {
    const categories = await blogModel.find().sort({ createdAt: -1 });

  
 res.status(200).json({
      success: true,
      totalCategory: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};


export const getBlogByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await blogModel.findOne({
      'blogs._id': id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const blog = category.blogs.id(id);
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog' });
  }
};

export const EditBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, blogContent, blogCategory } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Blog ID required' });
    }

    //  FIND BLOG 
    const categoryDoc = await blogModel.findOne({
      "blogs._id": id,
    });

    if (!categoryDoc) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const blog = categoryDoc.blogs.id(id);

    //  UPDATE TEXT FIELDS 
    if (title) blog.title = title;
    if (blogContent) blog.blogContent = blogContent;

    //  IMAGE UPDATE 
    if (req.file) {
      // delete old image
      if (blog.publicId) {
        await cloudinary.uploader.destroy(blog.publicId, {
          resource_type: blog.resourceType || 'image',
        });
      }

      // upload new image
      const uploadedImage = await uploadOnCloudinary(
        req.file.path,
        'blogs_images'
      );

      blog.featuredImage = uploadedImage.url;
      blog.publicId = uploadedImage.public_id;
      blog.resourceType = uploadedImage.resource_type;
    }

    //  CATEGORY CHANGE 
    if (blogCategory && blogCategory !== categoryDoc.blogCategory) {
      // remove blog from old category
      categoryDoc.blogs.pull(id);
      await categoryDoc.save();

      // find or create new category
      let newCategory = await blogModel.findOne({ blogCategory });

      if (!newCategory) {
        newCategory = await blogModel.create({
          blogCategory,
          blogs: [blog],
        });
      } else {
        newCategory.blogs.push(blog);
        await newCategory.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Blog updated & category changed',
        blog,
      });
    }

    //  SAVE 
    await categoryDoc.save();

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      blog,
    });
  } catch (error) {
    console.error('Update Blog Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const DeleteBlogController = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category containing this blog
    const category = await blogModel.findOne({ 'blogs._id': id });
    if (!category) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Find blog inside category
    const blog = category.blogs.id(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // 1️⃣ Delete image from Cloudinary
    if (blog.publicId && blog.resourceType) {
      await deleteFromCloudinary(blog.publicId, blog.resourceType);
    }

    // 2️⃣ Remove blog from array
    category.blogs.pull(blog._id);

    // 3️⃣ If no blogs left → delete entire category
    if (category.blogs.length === 0) {
      await blogModel.findByIdAndDelete(category._id);

      return res.status(200).json({
        success: true,
        message: 'Blog deleted and category removed (no blogs left)',
      });
    }

    // 4️⃣ Otherwise save updated category
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

