import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  publicId: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  profileImage: { type: String, default: '' },
  phone: { type: String, unique: true, sparse: true, default: null },
  preferedCourse: { type: String, default: '' },
});

const profileModel = mongoose.models.profile || mongoose.model('profile', profileSchema);
export default profileModel;
