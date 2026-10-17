import express from "express";
import {
  SendInvitation,
  GetSentInvitations,
  CancelInvitation,
  GetCandidateInvitations,
  RespondToInvitation,
} from "./invitation.controller.js";
import { Authentication, Authorization } from "../auth/auth.middleware.js";

const router = express.Router();

// Recruiter & Employer endpoints
router.post(
  "/",
  Authentication,
  Authorization(["recruiter", "employer"]),
  SendInvitation
);
router.get(
  "/sent",
  Authentication,
  Authorization(["recruiter", "employer"]),
  GetSentInvitations
);
router.patch(
  "/:id/cancel",
  Authentication,
  Authorization(["recruiter", "employer"]),
  CancelInvitation
);

// Candidate endpoints
router.get(
  "/me",
  Authentication,
  Authorization(["candidate"]),
  GetCandidateInvitations
);
router.patch(
  "/:id/respond",
  Authentication,
  Authorization(["candidate"]),
  RespondToInvitation
);

export default router;
