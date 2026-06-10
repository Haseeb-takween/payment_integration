import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  isDev: (process.env.NODE_ENV ?? "development") === "development",
  mongodbUri: process.env.MONGODB_URI ?? "",
  corsOrigins: (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  paddle: {
    apiKey: process.env.PADDLE_API_KEY ?? "",
    webhookSecret: process.env.PADDLE_WEBHOOK_SECRET ?? "",
    environment: process.env.PADDLE_ENV ?? "sandbox",
  },
  plans: {
    basic: { id: "basic", name: "Basic", priceId: process.env.BASIC_PRICE_ID ?? "" },
    professional: {
      id: "professional",
      name: "Professional",
      priceId: process.env.PROFESSIONAL_PRICE_ID ?? "",
    },
    business: {
      id: "business",
      name: "Business",
      priceId: process.env.BUSINESS_PRICE_ID ?? "",
    },
  },
} as const;
