import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved'],
      default: 'new', // useful for admin dashboard
    },
  },
  { timestamps: true }, // automatically adds createdAt & updatedAt
);

const contactModel = mongoose.model('contact', contactSchema);
export default contactModel;
