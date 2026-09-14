import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri);
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ MongoDB :", err.message);
    process.exit(1);
  }
};