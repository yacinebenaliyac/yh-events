import { connectDB } from "./db.js";
import { Admin } from "./models.js";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    if (await Admin.countDocuments() >= 1) {
      console.log("⚠️  Un admin existe déjà. Seed annulé.");
      process.exit(0);
    }
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("❌ ADMIN_EMAIL / ADMIN_PASSWORD manquants dans .env");
      process.exit(1);
    }
    await Admin.create({ name: ADMIN_NAME || "Admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    console.log(`✅ Admin créé : ${ADMIN_EMAIL}`);
    process.exit(0);
  } catch (e) { console.error("❌", e.message); process.exit(1); }
})();