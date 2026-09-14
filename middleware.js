import jwt from "jsonwebtoken";
import { env } from "./env.js";
import { Admin, User, Provider } from "./models.js";

export const protect = (roles = ["user"]) => async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    const token = h?.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Non autorisé" });

    const payload = jwt.verify(token, env.jwtSecret);
    if (!roles.includes(payload.role)) return res.status(403).json({ message: "Accès refusé" });

    const Model = payload.role === "admin" ? Admin : payload.role === "provider" ? Provider : User;
    const account = await Model.findById(payload.id);
    if (!account) return res.status(401).json({ message: "Compte introuvable" });

    if (payload.role === "provider" && ["blocked", "rejected"].includes(account.status)) {
      return res.status(403).json({ message: "Compte désactivé par l'administrateur" });
    }

    req.user = account;
    req.role = payload.role;
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

export const adminOnly = async (req, res, next) => {
  if (req.role !== "admin") return res.status(403).json({ message: "Réservé à l'administrateur" });
  const count = await Admin.countDocuments();
  if (count > 1) return res.status(500).json({ message: "Erreur de sécurité : plusieurs admins" });
  next();
};

export const blockAdminRegistration = (_req, res) =>
  res.status(403).json({ message: "Inscription admin désactivée." });

export const notFound = (req, res) =>
  res.status(404).json({ message: `Route introuvable : ${req.originalUrl}` });

export const errorHandler = (err, req, res, _next) => {
  console.error("💥", err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Erreur serveur",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};