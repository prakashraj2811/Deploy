import dotenv from "dotenv";

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 4000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:4000",

  databaseUrl: required("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/matrimony?schema=public"),

  jwt: {
    accessSecret: required("JWT_SECRET", "dev_access_secret_change_me"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret_change_me"),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? "30d",
  },

  payment: {
    provider: process.env.PAYMENT_PROVIDER ?? "mock",
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
  },

  email: {
    provider: process.env.EMAIL_PROVIDER ?? "mock",
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPassword: process.env.SMTP_PASSWORD ?? "",
    smtpFrom: process.env.SMTP_FROM ?? "Matrimony <no-reply@example.com>",
  },

  sms: {
    provider: process.env.SMS_PROVIDER ?? "mock",
    apiKey: process.env.SMS_API_KEY ?? "",
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER ?? "local",
    aws: {
      accessKey: process.env.AWS_ACCESS_KEY ?? "",
      secretKey: process.env.AWS_SECRET_KEY ?? "",
      region: process.env.AWS_REGION ?? "",
      bucket: process.env.AWS_BUCKET ?? "",
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
      apiKey: process.env.CLOUDINARY_API_KEY ?? "",
      apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    },
  },

  redisUrl: process.env.REDIS_URL ?? "",
};
