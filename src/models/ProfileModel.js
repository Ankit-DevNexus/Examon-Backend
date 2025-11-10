import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  publicId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  profileImage: { type: String },
  phone: {
    type: String,
    default: '',
    unique: true,
    sparse: true, // allows multiple empty/null values
  },
  preferedCourse: { type: String },
});

const profileModel = mongoose.models.profile || mongoose.model('profile', profileSchema);
export default profileModel;
