import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";

import authRoutes from "./modules/auth/auth.routes";
import categoriesRoutes from "./modules/categories/categories.routes";
import modulesRoutes from "./modules/modules/modules.routes";
import progressRoutes from "./modules/progress/progress.routes";
import reflectionsRoutes from "./modules/reflections/reflections.routes";
import highlightsRoutes from "./modules/highlights/highlights.routes";
import favoritesRoutes from "./modules/favorites/favorites.routes";
import quizRoutes from "./modules/quiz/quiz.routes";
import actionsRoutes from "./modules/actions/actions.routes";
import paymentsRoutes from "./modules/payments/payments.routes";
import subscriptionPlansRoutes from "./modules/subscription-plans/subscription-plans.routes";
import reviewsRoutes from "./modules/reviews/reviews.routes";
import aiRoutes from "./modules/ai/ai.routes";
import bufferRoutes from "./modules/buffer/buffer.routes";

const app = express();

app.set("trust proxy", 1);

// Security — relaxed for Google OAuth popup
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS
const allowedOrigins = [
  env.clientUrl,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing — raw body for webhook verification (accept LS content-type)
app.use(
  express.json({
    type: ["application/json", "application/vnd.api+json"],
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Rate limiting — 100 requests per minute (excludes webhook)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  skip: (req) => req.path.endsWith("/webhook"),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please try again later.", statusCode: 429 } },
});
app.use("/api", limiter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Static files (uploaded media)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Multer upload config
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|webm|mkv)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("File type not supported"));
    }
  },
});

// Upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: { message: "No file uploaded" } });
    return;
  }
  const url = `${env.publicUrl}/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/reflections", reflectionsRoutes);
app.use("/api/highlights", highlightsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/actions", actionsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/subscription-plans", subscriptionPlansRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/buffer", bufferRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { message: "Route not found", statusCode: 404 } });
});

// Error handler
app.use(errorHandler);

export default app;
