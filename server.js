import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { env } from "./env.js";
import { connectDB } from "./db.js";
import { notFound, errorHandler } from "./middleware.js";
import routes from "./routes.js";
import { initSocket } from "./socketServer.js"; 

// Crée dossier uploads si absent
if (!fs.existsSync(env.uploadDir)) fs.mkdirSync(env.uploadDir, { recursive: true });

const app = express();
const server = http.createServer(app);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(env.uploadDir)));

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use("/api", routes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use(notFound);
app.use(errorHandler);

(async () => {
  await connectDB(env.mongoUri);
  initSocket(server);
  server.listen(env.port, () => console.log(`🚀 API + Socket.io : http://localhost:${env.port}`));
})();
