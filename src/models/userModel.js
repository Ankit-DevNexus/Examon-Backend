import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['admin', 'user'],
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }, // track last login
  loginHistory: [
    {
      loginAt: { type: Date },
      ip: String,
      userAgent: String,
    },
  ],
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
