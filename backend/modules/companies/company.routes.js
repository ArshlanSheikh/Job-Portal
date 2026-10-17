import express from "express";
import {
  GetMyCompanyProfile,
  UpdateMyCompanyProfile,
  UploadCompanyLogo,
  GetAllCompanies,
  GetCompanyById,
} from "./company.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";
import { uploadImage } from "../../config/multer.js";

const router = express.Router();

router.get("/my", Authentication, Authorization(["employer"]), GetMyCompanyProfile);
router.put("/my", Authentication, Authorization(["employer"]), UpdateMyCompanyProfile);
router.post(
  "/my/logo",
  Authentication,
  Authorization(["employer"]),
  uploadImage.single("logo"),
  UploadCompanyLogo
);
router.get("/", GetAllCompanies);
router.get("/:id", GetCompanyById);

export default router;
