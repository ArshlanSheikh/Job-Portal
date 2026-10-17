import express from "express";
import {
  ApplyToJob,
  GetCandidateApplications,
  WithdrawApplication,
  GetJobApplications,
  GetRecruiterAllApplications,
  GetApplicationById,
  UpdateApplicationStatus,
} from "./application.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";
import { uploadResume } from "../../config/multer.js";

const router = express.Router();

// Candidate endpoints
router.post(
  "/",
  Authentication,
  Authorization(["candidate"]),
  uploadResume.single("resume"),
  ApplyToJob
);
router.get("/me", Authentication, Authorization(["candidate"]), GetCandidateApplications);
router.patch("/:id/withdraw", Authentication, Authorization(["candidate"]), WithdrawApplication);

// Recruiter / Employer review endpoints
router.get("/job/:jobId", Authentication, Authorization(["recruiter", "employer"]), GetJobApplications);
router.get("/recruiter/all", Authentication, Authorization(["recruiter", "employer"]), GetRecruiterAllApplications);
router.patch("/:id/status", Authentication, Authorization(["recruiter", "employer"]), UpdateApplicationStatus);

// Shared detail endpoint
router.get("/:id", Authentication, GetApplicationById);

export default router;
