import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    link: { type: String },
    image: { type: String },
    publicId: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

const notificationModel = mongoose.model('Notification', notificationSchema);
export default notificationModel;
