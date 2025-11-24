import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import notificationModel from '../models/notificationModel.js';
// POST — CREATE NOTIFICATION
export const createNotification = async (req, res) => {
  try {
    const { title, subtitle, description, link, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!req.file) return res.status(400).json({ success: false, message: 'Image is required' });
    const uploadResponse = await uploadOnCloudinary(req.file.path, 'notifications');

    // ⬆ Create Notification in DB
    const notification = await notificationModel.create({
      title,
      subtitle,
      description,
      link,
      status,
      image: uploadResponse.url,
      publicId: uploadResponse.public_id,
    });

    // Emit socket event
    global._io.emit('new-notification', notification);

    return res.json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET — LATEST NOTIFICATIONS
export const getLatestNotification = async (req, res) => {
  try {
    const latest = await notificationModel.find().sort({ createdAt: -1 });

    res.json({ success: true, data: latest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, link, status } = req.body;

    const notification = await notificationModel.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    let imageUrl = notification.image;
    let publicId = notification.publicId;

    // New image uploaded?
    if (req.file) {
      // Upload new image to Cloudinary
      const uploaded = await uploadOnCloudinary(req.file.path, 'notifications');

      if (uploaded) {
        imageUrl = uploaded.secure_url;
        // Delete old image from Cloudinary
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
        publicId = uploaded.public_id;
      }
    }

    // Update data
    notification.title = title || notification.title;
    notification.subtitle = subtitle || notification.subtitle;
    notification.description = description || notification.description;
    notification.link = link || notification.link;
    notification.status = status || notification.status;
    notification.image = imageUrl;
    notification.publicId = publicId;

    await notification.save();

    global._io.emit('update-notification', notification);

    res.json({
      success: true,
      message: 'Notification updated successfully',
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationModel.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Delete image from Cloudinary if exists
    if (notification.publicId) {
      await deleteFromCloudinary(notification.publicId);
    }

    await notification.deleteOne();

    global._io.emit('delete-notification', { id });

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
