import dotenv from 'dotenv';
dotenv.config();
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import blogModel from '../models/blogModel.js';

// console.log('Cloudinary config:', {
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
// });

// export const BlogController = async (req, res) => {
//   try {
    // console.log('BlogController payload');
    // console.log('req.body:', req.body);
    // console.log('req.file:', req.file);

//     const { title, blogContent } = req.body;
//     const featuredImagePath = req.file?.path;

//     if (!blogContent || !title || !featuredImagePath) {
//       return res.status(400).json({
//         message: 'Missing title, content, or image file',
//         received: { featuredImagePath, title, blogContent },
//       });
//     }

//     const BlogFeaturedImage = req.file?.path;

//     if (!BlogFeaturedImage) {
//       return res.status(400).json({
//         success: false,
//         message: 'Blog image is missing',
//       });
//     }

//     let uploadedImage;
//     try {
//       uploadedImage = await uploadOnCloudinary(BlogFeaturedImage, 'course_images');

//       console.log('Upload Image', uploadedImage);
//     } catch (error) {
//       console.log('Error uploading image to cloudinary', error);
//       return res.status(500).json({ success: false, message: 'Error uploading image to cloudinary' });
//     }
//     const newBlog = new blogModel({
//       title,
//       blogContent,
//       featuredImage: uploadedImage.url,
//       publicId: uploadedImage.public_id,
//     });

//     await newBlog.save();
//     res.status(201).json({ message: 'Blog saved successfully!' });
//   } catch (err) {
//     console.error('Full error details:', err);
//     res.status(500).json({ message: 'Internal server error', error: err.message });
//   }
// };
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

// GET /api/blogs/:id
// export const getBlogByIdController = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Validate the id string
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid blog ID' });
//     }

//     //  Look up the blog
//     const blog = await blogModel.findById(id);

//     //  Handle “not found”
//     if (!blog) {
//       return res.status(404).json({ message: 'Blog not found' });
//     }

//     // Return the blog
//     res.status(200).json(blog);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error fetching blog' });
//   }
// };


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

// export const EditBlogController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, blogContent } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid blog ID' });
//     }

//     const existingBlog = await blogModel.findById(id);
//     if (!existingBlog) {
//       return res.status(404).json({ success: false, message: 'Blog not found' });
//     }

//     console.log('Uploaded File:', req.file);

//     const updateFields = {};
//     if (title?.trim()) updateFields.title = title.trim();
//     if (blogContent?.trim()) updateFields.blogContent = blogContent.trim();

//     if (req.file) {
//       const newImagePath = req.file.path;

//       // Delete old image from Cloudinary (if exists)
//       if (existingBlog.publicId) {
//         try {
//           await cloudinary.uploader.destroy(existingBlog.publicId);
//         } catch (cloudErr) {
//           console.error('Error deleting old image from Cloudinary:', cloudErr.message);
//         }
//       }

//       // Upload new image to Cloudinary
//       const uploadedImage = await uploadOnCloudinary(newImagePath);
//       if (uploadedImage) {
//         updateFields.featuredImage = uploadedImage.url;
//         updateFields.publicId = uploadedImage.public_id;
//       }
//     }

//     const updatedBlog = await blogModel.findByIdAndUpdate(id, updateFields, { new: true });
//     if (!updatedBlog) {
//       return res.status(404).json({ success: false, message: 'Blog not found' });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Blog updated successfully',
//       updatedBlog,
//     });
//   } catch (error) {
//     console.error('Error updating blog:', error);
//     res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
//   }
// };


// export const EditBlogController = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, blogContent } = req.body;

//     const category = await blogModel.findOne({ 'blogs._id': id });
//     console.log("category", category);
    
//     if (!category) {
//       return res.status(404).json({ message: 'Blog not found' });
//     }

//     const blog = category.blogs.id(id);
//     console.log("blog", blog);
    

//     if (title) blog.title = title.trim();
//     if (blogContent) blog.blogContent = blogContent.trim();

//     if (req.file) {
//       // delete old image
//       await cloudinary.uploader.destroy(blog.publicId);

//       // upload new
//       const uploadedImage = await uploadOnCloudinary(req.file.path, 'blogs');

//       blog.featuredImage = uploadedImage.secure_url;
//       blog.publicId = uploadedImage.public_id;
//       blog.resourceType = uploadedImage.resource_type;
//     }

//     await category.save();

//     res.status(200).json({
//       success: true,
//       message: 'Blog updated successfully',
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


export const EditBlogController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, blogContent } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Blog ID is required",
      });
    }

    /* ================= FETCH EXISTING BLOG ================= */
    const parentDoc = await blogModel.findOne(
      { "blogs._id": id },
      { "blogs.$": 1 }
    );

    if (!parentDoc || parentDoc.blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const existingBlog = parentDoc.blogs[0];

    /* ================= PREPARE UPDATE OBJECT ================= */
    const updateObj = {
      "blogs.$.title": title,
      "blogs.$.blogContent": blogContent,
      "blogs.$.updatedAt": new Date(),
    };

    /* ================= IMAGE UPDATE LOGIC ================= */
    if (req.file) {
      // Delete old image if exists
      if (existingBlog.publicId) {
        await deleteFromCloudinary(
          existingBlog.publicId,
          existingBlog.resourceType || "image"
        );
      }

      //Upload new image
      const upload = await uploadOnCloudinary(req.file.path, "blogs_images");

      // Update new image fields
      updateObj["blogs.$.image"] = upload.url;
      updateObj["blogs.$.publicId"] = upload.public_id;
      updateObj["blogs.$.resourceType"] = upload.resource_type;
    }

    /* ================= UPDATE BLOG ================= */
    await blogModel.updateOne(
      { "blogs._id": id },
      { $set: updateObj }
    );

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
    });
  } catch (error) {
    console.error("Update blog error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// export const DeleteBlogController = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ success: false, message: 'Invalid blog ID' });
//     }

//     const blog = await blogModel.findById(id);
//     if (!blog) {
//       return res.status(404).json({ success: false, message: 'Blog not found' });
//     }

//     if (blog.featuredImage) {
//       try {
//         const urlParts = blog.featuredImage.split('/');
//         const fileName = urlParts[urlParts.length - 1];
//         const publicId = `blogs/${fileName.split('.')[0]}`;

//         await cloudinary.uploader.destroy(publicId);
//         console.log(`Deleted Cloudinary image: ${publicId}`);
//       } catch (err) {
//         console.warn('Failed to delete Cloudinary image:', err.message);
//       }
//     }

//     await blogModel.findByIdAndDelete(id);

//     res.status(200).json({
//       success: true,
//       message: 'Blog deleted successfully',
//     });
//   } catch (error) {
//     console.error('Error deleting blog:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };

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

