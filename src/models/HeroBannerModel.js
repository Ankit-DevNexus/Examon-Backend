import mongoose from 'mongoose';

const bannersSchema = new mongoose.Schema({
  aboutBanner: [{
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


// import mongoose from 'mongoose';

// const bannerSchema = new mongoose.Schema(
//   {
//     url: String,
//     publicId: String,
//     resourceType: String,
//   },
//   { _id: false } 
// );

// const bannersSchema = new mongoose.Schema(
//   {
//     aboutBanner: bannerSchema,
//     courseBanner: bannerSchema,
//     blogBanner: bannerSchema,
//     contactBanner: bannerSchema,
//   },
//   { timestamps: true }
// );

// const bannersModel = mongoose.model('heroBanner', bannersSchema);
// export default bannersModel;
