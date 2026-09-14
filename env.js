import dotenv from "dotenv";
dotenv.config();

["MONGO_URI", "JWT_SECRET"].forEach((k) => {
  if (!process.env[k]) { console.error(`❌ Manquant : ${k}`); process.exit(1); }
});

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024),
  contactPhone: process.env.CONTACT_PHONE || "0669467938",
};