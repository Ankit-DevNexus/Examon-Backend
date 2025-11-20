import notificationOfferModel from '../models/notificationOfferModel.js';

export const notificationOfferController = async (req, res) => {
  try {
    const newNotification = await notificationOfferModel.create(req.body);

    // Emit socket event to all connected clients
    global._io.emit('new_notification', newNotification);

    res.status(201).json({
      success: true,
      message: 'Notification created & sent via socket!',
      data: newNotification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message,
    });
  }
};

export const getLatestDiscountNotification = async (req, res) => {
  try {
    const notification = await notificationOfferModel.find().sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification',
      error: error.message,
    });
  }
};
