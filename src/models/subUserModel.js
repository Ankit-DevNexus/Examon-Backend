import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const subUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: 'subUser',
  },
  allowedTabs :[{ type: String}],
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
  otpExpiresAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

// Hash password before saving
subUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
subUserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const subUserModel = mongoose.model('subuser', subUserSchema);
export default subUserModel;
