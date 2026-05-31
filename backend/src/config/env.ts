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

  lemonSqueezy: {
    apiKey: process.env.LEMONSQUEEZY_API_KEY || "",
    storeId: process.env.LEMONSQUEEZY_STORE_ID || "",
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "",
    variantIds: {
      monthly: process.env.LS_VARIANT_MONTHLY || "1727361",
      yearly: process.env.LS_VARIANT_YEARLY || "1727397",
      lifetime: process.env.LS_VARIANT_LIFETIME || "1727400",
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
