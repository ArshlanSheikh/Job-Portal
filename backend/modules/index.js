import express from "express";
import authRoutes from "./auth/auth.routes.js";
import candidateRoutes from "./candidates/candidate.routes.js";
import recruiterRoutes from "./recruiters/recruiter.routes.js";
import companyRoutes from "./companies/company.routes.js";
import jobRoutes from "./jobs/job.routes.js";
import savedJobRoutes from "./savedJobs/savedJob.routes.js";
import applicationRoutes from "./applications/application.routes.js";
import invitationRoutes from "./invitations/invitation.routes.js";
import notificationRoutes from "./notifications/notification.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/candidates", candidateRoutes);
router.use("/recruiters", recruiterRoutes);
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/saved-jobs", savedJobRoutes);
router.use("/applications", applicationRoutes);
router.use("/invitations", invitationRoutes);
router.use("/notifications", notificationRoutes);

export default router;

