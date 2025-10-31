import blogModel from "../model/blogModel.js";
import {uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import mongoose from "mongoose";

export const BlogController = async (req, res) => {
  try {
    // console.log("=== BlogController payload ===");
    // console.log("req.body:", req.body);
    // console.log("req.file:", req.file);

    const { title, blogContent } = req.body;
    const featuredImagePath = req.file?.path;

    if (!blogContent || !title || !featuredImagePath) {
      return res.status(400).json({
        message: "Missing title, content, or image file",
        received: {  featuredImagePath, title, blogContent }
      });
    }

   const BlogFeaturedImage = req.file?.path;

    if (!BlogFeaturedImage) {
      return res.status(400).json({
        success: false,
        message: "Blog image is missing"
      })
    }

    let uploadedImage;
    try {
      uploadedImage = await uploadOnCloudinary(BlogFeaturedImage);
      console.log("Upload Image", uploadedImage);
    } catch (error) {
      console.log("Error uploading image to cloudinary", error);
      return res.status(500).json({ success: false, message: "Error uploading image to cloudinary" });
    }
    const newBlog = new blogModel({
      featuredImage: uploadedImage?.secure_url,
      title,
      blogContent,
    });

    await newBlog.save();
    res.status(201).json({ message: "Blog saved successfully!" });
  } catch (err) {
     console.error(" Full error details:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


export const AllBlogController = async (req, res) => {
    try {
        const blogs = await blogModel.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json(blogs);

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch blogs' });
    }
}


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

export const BlogImageController = async (req, res) => {
    try {
        const localPath = req.file?.path;
        console.log("localPath", localPath);


        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localPath, {
            folder: "blogs"
        });

        // Remove local file after upload
        fs.unlinkSync(localPath);

        res.status(200).json({ url: result.secure_url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Image upload failed" });
    }
};

export const EditBlogController = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBlog = await blogModel.findByIdAndUpdate(id, {
            title: req.body.title,
            content: req.body.content
        }, { new: true })

        res.status(200).json({
            success: true,
            updatedBlog: updatedBlog
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs'
// import blogModel from '../model/blogModel.js';


// export const BlogController = async (req, res) => {
//     try {
//     const { blogContent } = req.body;

//     if (!blogContent) {
//         return res.status(400).json({ message: 'Blog content is required' });
//     }

//     const newBlog = new blogModel({
//         blogContent: blogContent,
//     });

//     await newBlog.save();

//     res.status(201).json({ message: 'Blog saved successfully!' });
//     } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error saving blog' });
//     }
// };

// export const AllBlogController = async (req, res) =>{
//     try {
//     const blogs = await blogModel.find().sort({ createdAt: -1});
//     res.status(200).json(blogs);

//     } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch blogs' });
//     }
// }  


// export const BlogImageController = async (req, res) => {
//     try {
//     const localPath = req.file?.path;
//     console.log("localPath", localPath);
    

//     // Upload to Cloudinary
//     const result = await cloudinary.uploader.upload(localPath, {
//         folder: "blogs"
//     });

//     // Remove local file after upload
//     fs.unlinkSync(localPath);

//     res.status(200).json({ url: result.secure_url });
//     } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Image upload failed" });
//     }
// };

// export const EditBlogController = async (req, res) => {
//     try {
//     const { id } = req.params;
//     const updatedBlog = await blogModel.findByIdAndUpdate(id, {
//         title: req.body.title,
//         content: req.body.content
//     }, { new: true })

//     res.status(200).json({
//         success: true,
//         updatedBlog: updatedBlog
//     })
//     } catch (error) {
//     res.status(500).json({
//         error: error.message
//     })
//     }
// }