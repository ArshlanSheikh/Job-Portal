import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import moduleRoutes from "./modules/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Static files for uploaded resumes and avatars
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Central API route mounting
app.use("/api/v1", moduleRoutes);

// Health check endpoint
app.get(["/health", "/api/v1/health"], (req, res) => {
  res.status(200).json({
    success: true,
    message: "Job Portal API is operating smoothly",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
    error: null,
  });
});

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
    data: null,
    error: "NOT_FOUND",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Global Error]", err);
  const status = err.status || 500;
  const message = err.message || "An unexpected internal server error occurred";

  res.status(status).json({
    success: false,
    message,
    data: null,
    error: process.env.NODE_ENV === "development" ? err.stack : "INTERNAL_SERVER_ERROR",
  });
});

export default app;
