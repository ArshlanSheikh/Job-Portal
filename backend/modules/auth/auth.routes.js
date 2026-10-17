import express from "express";
import {
  RegisterUser,
  LoginUser,
  RefreshToken,
  LogoutUser,
  GetCurrentUser,
  UpdateAccountInfo,
} from "./auth.controller.js";
import { Authentication } from "./auth.middleware.js";

const router = express.Router();

router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/refresh-token", RefreshToken);
router.post("/logout", Authentication, LogoutUser);
router.get("/me", Authentication, GetCurrentUser);
router.put("/account", Authentication, UpdateAccountInfo);

export default router;
