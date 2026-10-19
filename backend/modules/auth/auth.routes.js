import express from "express";
import {
  RegisterUser,
  LoginUser,
  RefreshToken,
  LogoutUser,
  GetCurrentUser,
  UpdateAccountInfo,
} from "./auth.controller.js";
import { Authentication, RateLimiter } from "./auth.middleware.js";

const router = express.Router();

const authRateLimiter = RateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many authentication requests from this IP. Please try again after 15 minutes.",
});

router.post("/register", authRateLimiter, RegisterUser);
router.post("/login", authRateLimiter, LoginUser);
router.post("/refresh-token", RefreshToken);
router.post("/logout", Authentication, LogoutUser);
router.get("/me", Authentication, GetCurrentUser);
router.put("/account", Authentication, UpdateAccountInfo);

export default router;
