import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema(
  {
    batchName: { type: String },
    syllabus: { type: String },
    duration: { type: String },
    price: { type: Number },
    teachers: [{ type: String }],

    images: [{ type: String }],      
    publicIds: [{ type: String }],   

    enrollLink: { type: String },
  },
  { timestamps: true },
);

const batchesCategorySchema = new mongoose.Schema(
  {
    batchCategory: { type: String, unique: true, lowercase: true },
    batches: [batchSchema],
  },
  { timestamps: true },
);

const liveBatchModel = mongoose.model('livebatch', batchesCategorySchema);
export default liveBatchModel;
