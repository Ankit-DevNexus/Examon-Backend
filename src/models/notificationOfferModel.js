import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: String,
  description: String,
  discount: Number,
  courseId: String,
  banner: String,
  cta: {
    label: String,
    url: String,
  },
  tags: [String],
  expiresIn: String,
  createdAt: String,
  priority: String,
  read: { type: Boolean, default: false },
});

const notificationOfferModel = mongoose.model('DiscountNotification', notificationSchema);
export default notificationOfferModel;
