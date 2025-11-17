import notificationModel from '../models/notificationModel.js';

// POST
export const createNotification = async (req, res) => {
  try {
    const { label, message, type, redirectURI, status } = req.body;

    if (!label || !message) {
      return res.status(400).json({ success: false, message: 'Label and message required' });
    }

    const notification = await notificationModel.create({
      label,
      message,
      type: type || 'info',
      redirectURI,
      status,
    });

    res.json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET
export const getLatestNotification = async (req, res) => {
  try {
    const latest = await notificationModel.findOne().sort({ createdAt: -1 });

    res.json({ success: true, data: latest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
