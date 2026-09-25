import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { env } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(env.isProduction ? "combined" : "dev"));

  app.use(
    rateLimit({
      windowMs: 15 * 60_000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  app.get("/health", (_req, res) => res.json({ success: true, message: "OK", data: { status: "healthy" } }));

  app.use("/api/v1", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
