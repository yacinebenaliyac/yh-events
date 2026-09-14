import { connectDB } from "./db.js";
import { Category } from "./models.js";
import dotenv from "dotenv";
dotenv.config();

const CATS = [
  { name: "Chanteurs", icon: "🎤", order: 1 },
  { name: "Organisateurs", icon: "📋", order: 2 },
  { name: "Coiffeurs & Maquilleurs", icon: "💇", order: 3 },
  { name: "Photographes", icon: "📸", order: 4 },
  { name: "Cameramen", icon: "🎥", order: 5 },
  { name: "Traiteurs", icon: "🍽️", order: 6 },
  { name: "Décorateurs", icon: "🎨", order: 7 },
  { name: "DJ & Musiciens", icon: "🎧", order: 8 },
  { name: "Location de salle", icon: "🏛️", order: 9 },
];

(async () => {
  await connectDB(process.env.MONGO_URI);
  for (const c of CATS) await Category.updateOne({ name: c.name }, c, { upsert: true });
  console.log("✅ Catégories initialisées");
  process.exit(0);
})();