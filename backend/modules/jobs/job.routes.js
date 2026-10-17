import express from "express";
import {
  CreateJob,
  GetAllJobs,
  GetJobById,
  GetMyCompanyJobs,
  UpdateJob,
  ChangeJobStatus,
  DeleteJob,
} from "./job.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", GetAllJobs);
router.get("/company/my", Authentication, Authorization(["recruiter", "employer"]), GetMyCompanyJobs);
router.get("/:id", GetJobById);

// Protected routes (Recruiter / Employer)
router.post("/", Authentication, Authorization(["recruiter", "employer"]), CreateJob);
router.put("/:id", Authentication, Authorization(["recruiter", "employer"]), UpdateJob);
router.patch("/:id/status", Authentication, Authorization(["recruiter", "employer"]), ChangeJobStatus);
router.delete("/:id", Authentication, Authorization(["recruiter", "employer"]), DeleteJob);

export default router;
