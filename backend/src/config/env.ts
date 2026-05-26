import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    prices: {
      monthly: process.env.STRIPE_PRICE_MONTHLY || "",
      yearly: process.env.STRIPE_PRICE_YEARLY || "",
      lifetime: process.env.STRIPE_PRICE_LIFETIME || "",
    },
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
  },

  redis: {
    url: process.env.REDIS_URL || "",
  },
} as const;
