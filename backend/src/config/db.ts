import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};
