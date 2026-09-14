import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import slugify from "slugify";

/* ============================================================
   ADMIN — UN SEUL ADMIN POSSIBLE
   ============================================================ */
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, default: "superadmin", immutable: true },
}, { timestamps: true });

adminSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Admin").countDocuments();
    if (count >= 1) return next(new Error("Un admin existe déjà — création interdite."));
  }
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
  next();
});
adminSchema.methods.comparePassword = function (c) { return bcrypt.compare(c, this.password); };

/* ============================================================
   USER (client)
   ============================================================ */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  city: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Provider" }],
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function (c) { return bcrypt.compare(c, this.password); };

/* ============================================================
   CATEGORY
   ============================================================ */
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, index: true },
  icon: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) this.slug = slugify(this.name, { lower: true });
  next();
});

/* ============================================================
   PROVIDER
   ============================================================ */
const providerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true },
  slug: { type: String, unique: true, index: true },
  email: { type: String, lowercase: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  city: { type: String, required: true, index: true },
  bio: { type: String, maxlength: 2000 },
  yearsOfExperience: { type: Number, default: 0 },
  coverImage: String,
  gallery: [String],
  socialLinks: { facebook: String, instagram: String, tiktok: String, website: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "blocked", "hidden"],
    default: "pending",
    index: true,
  },
  rejectionReason: String,
  adminNote: String,
  isFeatured: { type: Boolean, default: false, index: true },
  badge: { type: String, enum: ["none", "new", "verified", "top", "premium"], default: "none" },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  requestsCount: { type: Number, default: 0 },
}, { timestamps: true });

providerSchema.index({ name: "text", bio: "text", city: "text" });

providerSchema.pre("save", function (next) {
  if (this.isModified("name")) this.slug = slugify(`${this.name}-${Date.now().toString(36)}`, { lower: true });
  next();
});
providerSchema.pre("save", async function (next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
  next();
});
providerSchema.methods.comparePassword = function (c) { return bcrypt.compare(c, this.password); };

/* ============================================================
   OFFER
   ============================================================ */
const offerSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "DZD" },
  images: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

/* ============================================================
   REVIEW
   ============================================================ */
const reviewSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

reviewSchema.index({ provider: 1, user: 1 }, { unique: true });

reviewSchema.statics.recalcProviderRating = async function (providerId) {
  const stats = await this.aggregate([
    { $match: { provider: providerId, isApproved: true } },
    { $group: { _id: "$provider", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await mongoose.model("Provider").findByIdAndUpdate(providerId, {
    rating: stats[0]?.avg?.toFixed(1) || 0,
    reviewsCount: stats[0]?.count || 0,
  });
};
reviewSchema.post("save", function () { this.constructor.recalcProviderRating(this.provider); });

/* ============================================================
   REQUEST (demande de devis)
   ============================================================ */
const requestSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  eventDate: Date,
  budget: Number,
  status: { type: String, enum: ["new", "read", "responded", "closed"], default: "new", index: true },
}, { timestamps: true });

/* ============================================================
   NOTIFICATION
   ============================================================ */
const notifSchema = new mongoose.Schema({
  type: { type: String, enum: ["new_provider", "new_request", "new_review", "message", "booking"], required: true },
  title: String,
  message: String,
  link: String,
  isRead: { type: Boolean, default: false, index: true },
}, { timestamps: true });

/* ============================================================
   CONVERSATION (Chat)
   ============================================================ */
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderRole: { type: String, enum: ["user", "provider", "admin"], required: true },
  content: { type: String, required: true, maxlength: 2000 },
  readAt: Date,
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  messages: [messageSchema],
  lastMessage: String,
  lastMessageAt: Date,
  unreadClient: { type: Number, default: 0 },
  unreadProvider: { type: Number, default: 0 },
}, { timestamps: true });

conversationSchema.index({ client: 1, provider: 1 }, { unique: true });

/* ============================================================
   AVIS AVEC PHOTOS — extension de Review
   ============================================================ */
reviewSchema.add({
  photos: [String],
  serviceType: String,
  response: { type: String, maxlength: 1000 },
});

/* ============================================================
   DISPONIBILITÉ (Calendrier)
   ============================================================ */
const availabilitySchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  date: { type: Date, required: true },
  isAvailable: { type: Boolean, default: true },
  slots: [{ time: String, isBooked: { type: Boolean, default: false } }],
  note: String,
}, { timestamps: true });

availabilitySchema.index({ provider: 1, date: 1 }, { unique: true });

/* ============================================================
   RÉSERVATION
   ============================================================ */
const bookingSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: Date, required: true },
  time: String,
  status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending", index: true },
  serviceType: String,
  notes: String,
  totalAmount: Number,
  paidAmount: { type: Number, default: 0 },
}, { timestamps: true });

/* ============================================================
   PAIEMENT
   ============================================================ */
const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "DZD" },
  method: { type: String, enum: ["cib", "edahabia", "stripe", "cash"], required: true },
  status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending", index: true },
  transactionId: String,
  metadata: Object,
}, { timestamps: true });

/* ============================================================
   CODE PROMO
   ============================================================ */
const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, index: true },
  discountType: { type: String, enum: ["percent", "fixed"], required: true },
  discountValue: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  maxUses: { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  appliesTo: { type: String, enum: ["all", "category", "provider"], default: "all" },
  targetId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

/* ============================================================
   STATS PRESTATAIRE
   ============================================================ */
const statSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  date: { type: Date, required: true, index: true },
  views: { type: Number, default: 0 },
  requests: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
}, { timestamps: true });

statSchema.index({ provider: 1, date: 1 }, { unique: true });

/* ============================================================
   DEVIS
   ============================================================ */
const quoteSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  number: { type: String, unique: true, index: true },
  items: [{ description: String, quantity: Number, unitPrice: Number }],
  subtotal: Number,
  discount: { type: Number, default: 0 },
  promoCode: String,
  total: Number,
  currency: { type: String, default: "DZD" },
  validUntil: Date,
  notes: String,
  status: { type: String, enum: ["draft", "sent", "accepted", "rejected"], default: "draft" },
}, { timestamps: true });

/* ============================================================
   EXPORTS
   ============================================================ */
export const Admin = mongoose.model("Admin", adminSchema);
export const User = mongoose.model("User", userSchema);
export const Category = mongoose.model("Category", categorySchema);
export const Provider = mongoose.model("Provider", providerSchema);
export const Offer = mongoose.model("Offer", offerSchema);
export const Review = mongoose.model("Review", reviewSchema);
export const Request = mongoose.model("Request", requestSchema);
export const Notification = mongoose.model("Notification", notifSchema);

export const Conversation = mongoose.model("Conversation", conversationSchema);
export const Availability = mongoose.model("Availability", availabilitySchema);
export const Booking = mongoose.model("Booking", bookingSchema);
export const Payment = mongoose.model("Payment", paymentSchema);
export const Promo = mongoose.model("Promo", promoSchema);
export const Stat = mongoose.model("Stat", statSchema);
export const Quote = mongoose.model("Quote", quoteSchema);