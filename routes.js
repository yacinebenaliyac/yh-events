import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import multer from "multer";
import path from "path";
import crypto from "crypto";

import { env } from "./env.js";
import {
  Admin, User, Provider, Category, Offer, Review, Request, Notification,
  Conversation, Availability, Booking, Payment, Promo, Stat, Quote,
} from "./models.js";
import { protect, adminOnly, blockAdminRegistration } from "./middleware.js";
import { getIO } from "./socketServer.js";
import { generateQuotePDF } from "./pdf.js";

/* ══════════════════════════════════════════════════════════
   INITIALISATION (AVANT TOUTES LES ROUTES)
   ══════════════════════════════════════════════════════════ */
const router = Router();
const sign = (id, role) => jwt.sign({ id, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

/* ══════════════════════════════════════════════════════════
   UPLOAD (multer)
   ══════════════════════════════════════════════════════════ */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Format image non supporté"));
  },
});

/* ══════════════════════════════════════════════════════════
   AUTH
   ══════════════════════════════════════════════════════════ */
router.post("/auth/admin/register", blockAdminRegistration);

router.get("/auth/contact-info", (_req, res) => res.json({ phone: env.contactPhone }));

router.post("/auth/user/register", async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      city: z.string().optional(),
    }).parse(req.body);
    if (await User.findOne({ email: data.email }))
      return res.status(409).json({ message: "Email déjà utilisé" });
    const user = await User.create(data);
    res.status(201).json({
      token: sign(user._id, "user"),
      account: { id: user._id, name: user.name, email: user.email, role: "user" },
    });
  } catch (e) { next(e); }
});

router.post("/auth/provider/register", async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().min(2),
      username: z.string().min(3),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().min(6),
      password: z.string().min(6),
      category: z.string(),
      city: z.string(),
      bio: z.string().optional(),
    }).parse(req.body);

    if (await Provider.findOne({ phone: data.phone }))
      return res.status(409).json({ message: "Ce numéro est déjà utilisé" });

    const provider = await Provider.create({ ...data, status: "pending" });

    await Notification.create({
      type: "new_provider",
      title: "Nouvelle inscription prestataire",
      message: `${provider.name} (${provider.city}) attend une validation.`,
      link: `/admin/providers/${provider._id}`,
    }).catch(() => {});

    res.status(201).json({
      message: "Inscription envoyée. Contactez l'admin pour validation.",
      contactPhone: env.contactPhone,
      provider: { id: provider._id, name: provider.name, status: provider.status },
    });
  } catch (e) { next(e); }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;
    const map = { user: User, provider: Provider, admin: Admin };
    const Model = map[role];
    if (!Model) return res.status(400).json({ message: "Rôle invalide" });

    const query = role === "provider"
      ? { $or: [{ phone: identifier }, { username: identifier }] }
      : { email: identifier };

    const account = await Model.findOne(query).select("+password");
    if (!account || !(await account.comparePassword(password)))
      return res.status(401).json({ message: "Identifiants incorrects" });

    if (role === "provider" && account.status !== "approved") {
      return res.status(403).json({
        message: account.status === "pending"
          ? `Compte en attente. Contactez l'admin : ${env.contactPhone}`
          : "Compte bloqué ou rejeté par l'administrateur.",
        status: account.status,
      });
    }

    res.json({
      token: sign(account._id, role),
      account: { id: account._id, name: account.name, email: account.email, role },
    });
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   CATEGORIES
   ══════════════════════════════════════════════════════════ */
router.get("/categories", async (_req, res) => {
  res.json(await Category.find({ isActive: true }).sort("order name"));
});

/* ══════════════════════════════════════════════════════════
   PROVIDERS (public)
   ══════════════════════════════════════════════════════════ */
router.get("/providers", async (req, res) => {
  const { q, category, city, featured, page = 1, limit = 12, sort = "-rating" } = req.query;
  const filter = { status: "approved" };
  if (category) filter.category = category;
  if (city) filter.city = city;
  if (featured === "true") filter.isFeatured = true;
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Provider.find(filter).populate("category", "name slug icon")
      .sort(sort).skip((page - 1) * limit).limit(Number(limit)),
    Provider.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.get("/providers/:slug", async (req, res) => {
  const provider = await Provider.findOne({ slug: req.params.slug, status: "approved" })
    .populate("category", "name slug icon");
  if (!provider) return res.status(404).json({ message: "Prestataire introuvable" });

  provider.viewsCount += 1;
  await provider.save();

  const [offers, reviews] = await Promise.all([
    Offer.find({ provider: provider._id, isActive: true }),
    Review.find({ provider: provider._id, isApproved: true })
      .populate("user", "name").sort("-createdAt").limit(20),
  ]);
  res.json({ provider, offers, reviews });
});

/* ══════════════════════════════════════════════════════════
   REQUESTS (public)
   ══════════════════════════════════════════════════════════ */
router.post("/requests", async (req, res, next) => {
  try {
    const data = z.object({
      provider: z.string(),
      name: z.string().min(2),
      phone: z.string().min(6),
      message: z.string().min(5),
      eventDate: z.string().optional(),
      budget: z.number().optional(),
    }).parse(req.body);

    const request = await Request.create(data);
    await Provider.findByIdAndUpdate(data.provider, { $inc: { requestsCount: 1 } });

    await Notification.create({
      type: "new_request",
      title: "Nouvelle demande de devis",
      message: `${data.name} — ${data.phone}`,
      link: `/admin/requests`,
    }).catch(() => {});

    res.status(201).json({ message: "Demande envoyée", id: request._id });
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   CHAT (Conversations)
   ══════════════════════════════════════════════════════════ */
router.post("/conversations", protect(["user"]), async (req, res, next) => {
  try {
    const { providerId } = req.body;
    let conv = await Conversation.findOne({ client: req.user._id, provider: providerId });
    if (!conv) conv = await Conversation.create({ client: req.user._id, provider: providerId });
    res.json(conv);
  } catch (e) { next(e); }
});

router.get("/conversations/me", protect(["user", "provider"]), async (req, res, next) => {
  try {
    const filter = req.role === "user" ? { client: req.user._id } : { provider: req.user._id };
    const list = await Conversation.find(filter)
      .populate("client", "name")
      .populate("provider", "name coverImage")
      .sort("-lastMessageAt");
    res.json(list);
  } catch (e) { next(e); }
});

router.get("/conversations/:id", protect(["user", "provider"]), async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id)
      .populate("client", "name")
      .populate("provider", "name coverImage");
    if (!conv) return res.status(404).json({ message: "Conversation introuvable" });

    const isPart = String(conv.client._id) === String(req.user._id)
      || String(conv.provider._id) === String(req.user._id);
    if (!isPart) return res.status(403).json({ message: "Accès refusé" });

    res.json(conv);
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   AVIS AVEC PHOTOS
   ══════════════════════════════════════════════════════════ */
router.post("/reviews", protect(["user"]), upload.array("photos", 5), async (req, res, next) => {
  try {
    const { provider, rating, comment, serviceType } = req.body;
    const photos = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const review = await Review.create({
      provider, user: req.user._id,
      rating: Number(rating), comment, serviceType, photos,
    });
    res.status(201).json(review);
  } catch (e) { next(e); }
});

router.patch("/reviews/:id/response", protect(["provider"]), async (req, res, next) => {
  try {
    const r = await Review.findOneAndUpdate(
      { _id: req.params.id, provider: req.user._id },
      { response: req.body.response },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: "Avis introuvable" });
    res.json(r);
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   DISPONIBILITÉ
   ══════════════════════════════════════════════════════════ */
router.get("/availability/:providerId", async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const filter = { provider: req.params.providerId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    res.json(await Availability.find(filter).sort("date"));
  } catch (e) { next(e); }
});

router.post("/availability", protect(["provider"]), async (req, res, next) => {
  try {
    const { date, isAvailable, slots, note } = req.body;
    const doc = await Availability.findOneAndUpdate(
      { provider: req.user._id, date: new Date(date) },
      { isAvailable, slots: slots || [], note },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   RÉSERVATION
   ══════════════════════════════════════════════════════════ */
router.post("/bookings", protect(["user"]), async (req, res, next) => {
  try {
    const booking = await Booking.create({ ...req.body, client: req.user._id });
    const io = getIO();
    if (io) io.to(`user:${booking.provider}`).emit("notification", {
      type: "booking",
      title: "Nouvelle réservation",
      message: `Le ${new Date(booking.date).toLocaleDateString("fr-FR")}`,
    });
    res.status(201).json(booking);
  } catch (e) { next(e); }
});

router.get("/bookings/me", protect(["user", "provider"]), async (req, res, next) => {
  try {
    const filter = req.role === "user" ? { client: req.user._id } : { provider: req.user._id };
    res.json(await Booking.find(filter).populate("provider", "name").populate("client", "name").sort("-date"));
  } catch (e) { next(e); }
});

router.patch("/bookings/:id/status", protect(["provider", "user"]), async (req, res, next) => {
  try {
    const b = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(b);
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   PAIEMENT (mock)
   ══════════════════════════════════════════════════════════ */
router.post("/payments/create", protect(["user"]), async (req, res, next) => {
  try {
    const { bookingId, amount, method } = req.body;

    const payment = await Payment.create({
      booking: bookingId,
      client: req.user._id,
      amount,
      method,
      status: "pending",
      transactionId: `TX-${Date.now()}`,
    });

    res.status(201).json({
      paymentId: payment._id,
      transactionId: payment.transactionId,
      redirectUrl: method === "stripe"
        ? `https://checkout.stripe.com/pay/${payment.transactionId}`
        : `/payment/confirm/${payment._id}`,
    });
  } catch (e) { next(e); }
});

router.post("/payments/:id/confirm", protect(["user"]), async (req, res, next) => {
  try {
    const p = await Payment.findByIdAndUpdate(req.params.id, { status: "paid" }, { new: true });
    if (p.booking) {
      await Booking.findByIdAndUpdate(p.booking, { paidAmount: p.amount, status: "confirmed" });
    }
    res.json(p);
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   CODES PROMO (public : validation)
   ══════════════════════════════════════════════════════════ */
router.post("/promos/validate", async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) return res.status(404).json({ message: "Code invalide" });
    if (promo.expiresAt && promo.expiresAt < new Date()) return res.status(400).json({ message: "Code expiré" });
    if (promo.usedCount >= promo.maxUses) return res.status(400).json({ message: "Code épuisé" });
    if (amount < promo.minAmount) return res.status(400).json({ message: `Minimum ${promo.minAmount} DZD` });

    const discount = promo.discountType === "percent"
      ? Math.round(amount * promo.discountValue / 100)
      : promo.discountValue;

    res.json({ promo, discount, finalAmount: Math.max(0, amount - discount) });
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   STATS PRESTATAIRE
   ══════════════════════════════════════════════════════════ */
router.get("/stats/me", protect(["provider"]), async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const stats = await Stat.find({ provider: req.user._id, date: { $gte: since } }).sort("date");

    const totals = stats.reduce((acc, s) => ({
      views: acc.views + s.views,
      requests: acc.requests + s.requests,
      bookings: acc.bookings + s.bookings,
      revenue: acc.revenue + s.revenue,
    }), { views: 0, requests: 0, bookings: 0, revenue: 0 });

    res.json({ stats, totals });
  } catch (e) { next(e); }
});

router.post("/stats/:providerId/view", async (req, res) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  await Stat.findOneAndUpdate(
    { provider: req.params.providerId, date: today },
    { $inc: { views: 1 } },
    { upsert: true }
  );
  res.json({ ok: true });
});

/* ══════════════════════════════════════════════════════════
   DEVIS PDF
   ══════════════════════════════════════════════════════════ */
router.post("/quotes", protect(["provider"]), async (req, res, next) => {
  try {
    const { items, discount = 0, promoCode, notes, validUntil } = req.body;
    const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
    const total = Math.max(0, subtotal - discount);

    const number = `DEV-${Date.now().toString().slice(-6)}`;
    const quote = await Quote.create({
      provider: req.user._id, number, items, subtotal,
      discount, promoCode, total, notes, validUntil,
    });
    res.status(201).json(quote);
  } catch (e) { next(e); }
});

router.get("/quotes/:id/pdf", protect(["provider", "user", "admin"]), async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "Devis introuvable" });
    const provider = await Provider.findById(quote.provider);
    generateQuotePDF(quote, provider, res);
  } catch (e) { next(e); }
});

/* ══════════════════════════════════════════════════════════
   ADMIN (routes protégées)
   ══════════════════════════════════════════════════════════ */
const adminRouter = Router();
adminRouter.use(protect(["admin"]), adminOnly);

adminRouter.get("/stats", async (_req, res) => {
  const [users, providers, pending, requests, categories, unread] = await Promise.all([
    User.countDocuments(),
    Provider.countDocuments({ status: "approved" }),
    Provider.countDocuments({ status: "pending" }),
    Request.countDocuments({ status: "new" }),
    Category.countDocuments(),
    Notification.countDocuments({ isRead: false }),
  ]);
  res.json({ users, providers, pending, requests, categories, unread });
});

adminRouter.get("/notifications", async (_req, res) => {
  res.json(await Notification.find().sort("-createdAt").limit(50));
});

adminRouter.patch("/notifications/:id/read", async (req, res) => {
  res.json(await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true }));
});

adminRouter.patch("/providers/:id/status", async (req, res) => {
  const { status, reason } = req.body;
  const update = { status };
  if (reason) update.rejectionReason = reason;

  const provider = await Provider.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!provider) return res.status(404).json({ message: "Introuvable" });

  await Notification.create({
    type: "new_provider",
    title: `Prestataire ${status}`,
    message: `${provider.name} → ${status}`,
    link: `/admin/providers/${provider._id}`,
  }).catch(() => {});

  res.json(provider);
});

adminRouter.patch("/providers/:id/feature", async (req, res) => {
  const { isFeatured, badge } = req.body;
  const update = {};
  if (typeof isFeatured === "boolean") update.isFeatured = isFeatured;
  if (badge) update.badge = badge;
  res.json(await Provider.findByIdAndUpdate(req.params.id, update, { new: true }));
});

adminRouter.get("/providers", async (req, res) => {
  const { status, category, city, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (city) filter.city = city;
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    Provider.find(filter).populate("category", "name slug")
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Provider.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
});

adminRouter.get("/providers/:id", async (req, res) => {
  const p = await Provider.findById(req.params.id).populate("category", "name slug");
  if (!p) return res.status(404).json({ message: "Introuvable" });
  res.json(p);
});

adminRouter.post("/categories", async (req, res) => res.status(201).json(await Category.create(req.body)));
adminRouter.put("/categories/:id", async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })));
adminRouter.delete("/categories/:id", async (req, res) => { await Category.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

/* Admin — Promos */
adminRouter.get("/promos", async (_req, res) => {
  res.json(await Promo.find().sort("-createdAt"));
});
adminRouter.post("/promos", async (req, res) => {
  res.status(201).json(await Promo.create(req.body));
});
adminRouter.patch("/promos/:id", async (req, res) => {
  res.json(await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
adminRouter.delete("/promos/:id", async (req, res) => {
  await Promo.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.use("/admin", adminRouter);

/* ══════════════════════════════════════════════════════════
   EXPORT
   ══════════════════════════════════════════════════════════ */
export default router;
