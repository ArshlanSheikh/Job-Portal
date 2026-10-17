import express from "express";
import {
  GetMyRecruiterProfile,
  UpdateMyRecruiterProfile,
  UploadRecruiterPhoto,
  GetRecruiterById,
} from "./recruiter.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";
import { uploadImage } from "../../config/multer.js";

const router = express.Router();

router.get("/me", Authentication, Authorization(["recruiter"]), GetMyRecruiterProfile);
router.put("/me", Authentication, Authorization(["recruiter"]), UpdateMyRecruiterProfile);
router.post(
  "/me/photo",
  Authentication,
  Authorization(["recruiter"]),
  uploadImage.single("photo"),
  UploadRecruiterPhoto
);
router.get("/:id", Authentication, GetRecruiterById);

export default router;
