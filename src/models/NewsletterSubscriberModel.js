// models/NewsletterSubscriber.js
import mongoose from 'mongoose';

const NewsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

const NewsletterSubscriberModel = mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
export default NewsletterSubscriberModel;
