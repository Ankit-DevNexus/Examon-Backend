import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  label: { type: String }, // e.g. "New Course", "Live Batch"
  message: { type: String },
  type: { type: String },
  redirectURI: { type: String, default: 'info' },
  status: { type: String, ENUM: ('active', 'inactive'), default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const notificationModel = mongoose.model('Notification', notificationSchema);
export default notificationModel;
