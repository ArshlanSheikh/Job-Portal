import express from "express";
import {
  GetMyCompanyProfile,
  UpdateMyCompanyProfile,
  UploadCompanyLogo,
  GetAllCompanies,
  GetCompanyById,
  GetEmployerDashboard,
  GetCompanyRecruiters,
  RemoveCompanyRecruiter,
} from "./company.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";
import { uploadImage } from "../../config/multer.js";

const router = express.Router();

// Employer dashboard & company routes
router.get("/dashboard", Authentication, Authorization(["employer"]), GetEmployerDashboard);
router.get("/my", Authentication, Authorization(["employer"]), GetMyCompanyProfile);
router.put("/my", Authentication, Authorization(["employer"]), UpdateMyCompanyProfile);
router.post(
  "/my/logo",
  Authentication,
  Authorization(["employer"]),
  uploadImage.single("logo"),
  UploadCompanyLogo
);

// Recruiter authorization management by employer
router.get("/my/recruiters", Authentication, Authorization(["employer"]), GetCompanyRecruiters);
router.delete("/my/recruiters/:recruiterId", Authentication, Authorization(["employer"]), RemoveCompanyRecruiter);

router.get("/", GetAllCompanies);
router.get("/:id", GetCompanyById);

export default router;
