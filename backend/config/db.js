import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is missing. Put it in backend/.env or check the env file path.");
    throw new Error("MONGO_URI is missing");
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("Check: Atlas username/password, database user permissions, and Network Access IP allowlist.");
    throw error;
  }
};

export default connectDB;
