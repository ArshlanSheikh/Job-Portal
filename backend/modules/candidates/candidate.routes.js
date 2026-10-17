import express from "express";
import {
  GetMyCandidateProfile,
  GetCandidateById,
  UpdateCandidateProfile,
  UploadCandidateResume,
  UploadCandidatePhoto,
  DeleteCandidateResume,
} from "./candidate.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";
import { uploadResume, uploadImage } from "../../config/multer.js";

const router = express.Router();

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
router.get("/:id", Authentication, GetCandidateById);

export default router;
