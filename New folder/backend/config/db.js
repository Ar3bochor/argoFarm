import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These are the recommended options for Mongoose 8+
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected.");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB error:", err.message);
    });

  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);

    if (retries > 0) {
      console.log(`   Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }

    console.error("   All retries exhausted. Exiting.");
    process.exit(1);
  }
};

export default connectDB;