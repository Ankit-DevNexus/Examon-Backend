import bannersModel from '../models/HeroBannerModel.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';

const uploadFiles = async (files) =>
  Promise.all(
    files.map(async (file) => {
      const f = await uploadOnCloudinary(file.path, 'All_Banners');
      return {
        url: f.url,
        publicId: f.public_id,
        resourceType: f.resource_type,
      };
    }),
  );

  
export const addBanner = async (req, res) => {
  try {
    const banner = await bannersModel.create({
      aboutBanner: req.files?.image1 ? await uploadFiles(req.files.image1) : [],
      courseBanner: req.files?.image2 ? await uploadFiles(req.files.image2) : [],
      blogBanner: req.files?.image3 ? await uploadFiles(req.files.image3) : [],
      contactBanner: req.files?.image4 ? await uploadFiles(req.files.image4) : [],
    });

    res.status(201).json({
      success: true,
      message: 'Banner added successfully',
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding banner',
      error: error.message,
    });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banner = await bannersModel.find();

    res.status(200).json({
      success: true,
      message: 'All banner fetched successfully',
      banners: banner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching banners',
      error: error.message,
    });
  }
};


export const updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;
console.log('FILES:', req.files);

    const banner = await bannersModel.findById(bannerId);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    //  ABOUT BANNER 
    if (req.files?.image1) {
      // delete old images
      for (const img of banner.aboutBanner) {
        await deleteFromCloudinary(img.publicId, img.resourceType);
      }

      banner.aboutBanner = await uploadFiles(req.files.image1);
    }

    //  COURSE BANNER 
    if (req.files?.image2) {
      for (const img of banner.courseBanner) {
        await deleteFromCloudinary(img.publicId, img.resourceType);
      }

      banner.courseBanner = await uploadFiles(req.files.image2);
    }

    //  BLOG BANNER 
    if (req.files?.image3) {
      for (const img of banner.blogBanner) {
        await deleteFromCloudinary(img.publicId, img.resourceType);
      }

      banner.blogBanner = await uploadFiles(req.files.image3);
    }

    //  CONTACT BANNER 
    if (req.files?.image4) {
      for (const img of banner.contactBanner) {
        await deleteFromCloudinary(img.publicId, img.resourceType);
      }

      banner.contactBanner = await uploadFiles(req.files.image4);
    }

    await banner.save();

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating banner',
      error: error.message,
    });
  }
};


export const deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const banner = await bannersModel.findById(bannerId);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    /* ================= DELETE ALL CLOUDINARY IMAGES ================= */

    const deleteImages = async (images = []) => {
      for (const img of images) {
        await deleteFromCloudinary(img.publicId, img.resourceType);
      }
    };

    await deleteImages(banner.aboutBanner);
    await deleteImages(banner.courseBanner);
    await deleteImages(banner.blogBanner);
    await deleteImages(banner.contactBanner);

    /* ================= DELETE DB RECORD ================= */

    await bannersModel.findByIdAndDelete(bannerId);

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting banner',
      error: error.message,
    });
  }
};
