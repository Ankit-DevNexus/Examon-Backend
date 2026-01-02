import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    discount: Number,
    courseId: String,
    tags: [String],
    link: String,
  },
  {
    timestamps: true,
  },
);

const notificationOfferModel = mongoose.model('DiscountNotification', notificationSchema);
export default notificationOfferModel;
