import mongoose from 'mongoose';

export const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log('Connected to mongo DB');
  } catch (error) {
    console.error('Dashboard DB connection error:', error.message);
  }
};
