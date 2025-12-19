import mongoose from 'mongoose';

const bannersSchema = new mongoose.Schema({
  aboutBanner: [
    {
      url: String,
      publicId: String,
      resourceType: String,
    },
  ],
  courseBanner:[{
    url: String,
    publicId: String,
    resourceType: String
  }],
  blogBanner:[{
    url: String,
    publicId: String,
    resourceType: String
  }],
  contactBanner:[{
    url: String,
    publicId: String,
    resourceType: String
  }],
});


const bannersModel = mongoose.model('heroBanner', bannersSchema);

export default bannersModel;