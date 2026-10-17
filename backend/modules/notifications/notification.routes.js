import express from "express";
import {
  GetMyNotifications,
  GetUnreadCount,
  MarkAsRead,
  MarkAllAsRead,
  DeleteNotification,
} from "./notification.controller.js";
import { Authentication } from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/", Authentication, GetMyNotifications);
router.get("/unread-count", Authentication, GetUnreadCount);
router.patch("/:id/read", Authentication, MarkAsRead);
router.patch("/read-all", Authentication, MarkAllAsRead);
router.delete("/:id", Authentication, DeleteNotification);

export default router;
