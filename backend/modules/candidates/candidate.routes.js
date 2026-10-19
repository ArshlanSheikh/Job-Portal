import express from "express";
import {
  GetMyCandidateProfile,
  GetCandidateById,
  UpdateCandidateProfile,
  UploadCandidateResume,
  UploadCandidatePhoto,
  DeleteCandidateResume,
  SearchCandidates,
  GetCandidateDetailsForRecruiter,
  GetCandidateDashboard,
} from "./candidate.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";
import { uploadResume, uploadImage } from "../../config/multer.js";

const router = express.Router();

// Candidate dashboard route
router.get("/dashboard", Authentication, Authorization(["candidate"]), GetCandidateDashboard);

// Candidate private profile routes
router.get("/me", Authentication, Authorization(["candidate"]), GetMyCandidateProfile);
router.put("/me", Authentication, Authorization(["candidate"]), UpdateCandidateProfile);
router.post(
  "/me/resume",
  Authentication,
  Authorization(["candidate"]),
  uploadResume.single("resume"),
  UploadCandidateResume
);
router.delete("/me/resume", Authentication, Authorization(["candidate"]), DeleteCandidateResume);
router.post(
  "/me/photo",
  Authentication,
  Authorization(["candidate"]),
  uploadImage.single("photo"),
  UploadCandidatePhoto
);

// Recruiter discovery routes (must be before /:id)
router.get(
  "/search",
  Authentication,
  Authorization(["recruiter", "employer"]),
  SearchCandidates
);
router.get(
  "/detail/:id",
  Authentication,
  Authorization(["recruiter", "employer"]),
  GetCandidateDetailsForRecruiter
);

// General ID lookup
router.get("/:id", Authentication, GetCandidateById);

export default router;
