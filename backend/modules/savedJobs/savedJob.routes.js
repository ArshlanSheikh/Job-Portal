import express from "express";
import {
  SaveJob,
  UnsaveJob,
  GetMySavedJobs,
} from "./savedJob.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";

const router = express.Router();

router.get("/", Authentication, Authorization(["candidate"]), GetMySavedJobs);
router.post("/:jobId", Authentication, Authorization(["candidate"]), SaveJob);
router.delete("/:jobId", Authentication, Authorization(["candidate"]), UnsaveJob);

export default router;
