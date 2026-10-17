import express from "express";
import authRoutes from "./auth/auth.routes.js";
import candidateRoutes from "./candidates/candidate.routes.js";
import recruiterRoutes from "./recruiters/recruiter.routes.js";
import companyRoutes from "./companies/company.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/candidates", candidateRoutes);
router.use("/recruiters", recruiterRoutes);
router.use("/companies", companyRoutes);

export default router;
