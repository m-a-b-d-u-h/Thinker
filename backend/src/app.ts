import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";

import authRoutes from "./modules/auth/auth.routes";
import modulesRoutes from "./modules/modules/modules.routes";
import progressRoutes from "./modules/progress/progress.routes";
import reflectionsRoutes from "./modules/reflections/reflections.routes";
import highlightsRoutes from "./modules/highlights/highlights.routes";
import favoritesRoutes from "./modules/favorites/favorites.routes";
import quizRoutes from "./modules/quiz/quiz.routes";
import paymentsRoutes from "./modules/payments/payments.routes";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing — raw body for Stripe webhooks
app.use(
  express.json({
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

// Rate limiting — 100 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please try again later.", statusCode: 429 } },
});
app.use("/api", limiter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/modules", modulesRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/reflections", reflectionsRoutes);
app.use("/api/highlights", highlightsRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/payments", paymentsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { message: "Route not found", statusCode: 404 } });
});

// Error handler
app.use(errorHandler);

export default app;
