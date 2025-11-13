import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['admin', 'user'],
  },
  isActive: { type: Boolean, default: false },
  lastLogin: { type: Date }, // track last login
  loginHistory: [
    {
      loginAt: { type: Date },
      ip: String,
      userAgent: String,
    },
  ],
  refreshToken: String,
  tokenVersion: { type: Number, default: 0 },
  otp: String,
  otpExpiresAt: String,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
const userModel = mongoose.model('user', userSchema);
export default userModel;
