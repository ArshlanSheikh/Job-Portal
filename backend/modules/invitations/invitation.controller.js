import Invitation from "./invitation.model.js";
import Job from "../jobs/job.model.js";
import User from "../auth/auth.model.js";
import Company from "../companies/company.model.js";
import Recruiter from "../recruiters/recruiter.model.js";
import Notification from "../notifications/notification.model.js";

// Helper to determine the company associated with the user
const resolveUserCompany = async (user) => {
  if (user.role === "employer") {
    return await Company.findOne({ employerId: user._id });
  }

  if (user.role === "recruiter") {
    const recruiter = await Recruiter.findOne({ userId: user._id });
    if (recruiter && recruiter.company) {
      return await Company.findById(recruiter.company);
    }
  }

  return null;
};

/**
 * Send job invitation to a candidate (Recruiter or Employer)
 */
const SendInvitation = async (req, res) => {
  try {
    console.log("Hit SendInvitation api...");
    const { candidateId, jobId, message = "" } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID and Job ID are required",
        data: null,
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found",
        data: null,
        error: "JOB_NOT_FOUND",
      });
    }

    // Verify authority over the job
    const company = await resolveUserCompany(req.user);
    const isCreator = job.createdBy.toString() === req.user._id.toString();
    const isCompanyStaff =
      company && job.company.toString() === company._id.toString();

    if (!isCreator && !isCompanyStaff) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to send invitations for this job opening",
        data: null,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    // Verify candidate
    const candidateUser = await User.findById(candidateId);
    if (!candidateUser || candidateUser.role !== "candidate") {
      return res.status(404).json({
        success: false,
        message: "Candidate account not found",
        data: null,
        error: "CANDIDATE_NOT_FOUND",
      });
    }

    // Check duplicate active invitation
    const existing = await Invitation.findOne({
      jobId,
      candidateId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An active pending invitation for this job has already been sent to this candidate",
        data: existing,
        error: "DUPLICATE_INVITATION",
      });
    }

    const invitation = await Invitation.create({
      jobId,
      candidateId,
      recruiterId: req.user._id,
      companyId: job.company,
      message: message ? message.trim() : "",
      status: "pending",
    });

    // Notify Candidate
    await Notification.create({
      recipientId: candidateId,
      senderId: req.user._id,
      type: "INVITATION_RECEIVED",
      title: "New Job Invitation",
      message: `${req.user.name} invited you to explore and apply for "${job.title}".`,
      link: `/invitations`,
      metadata: { invitationId: invitation._id, jobId: job._id },
    });

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully to candidate",
      data: invitation,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle SendInvitation", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send invitation",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get invitations sent by the authenticated recruiter
 */
const GetSentInvitations = async (req, res) => {
  try {
    console.log("Hit GetSentInvitations api...");
    const { status, page = 1, limit = 20 } = req.query;

    const query = { recruiterId: req.user._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Invitation.countDocuments(query);

    const invitations = await Invitation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("candidateId", "name email phone avatar")
      .populate("jobId", "title location workplaceType employmentType")
      .populate("companyId", "companyName logo");

    return res.status(200).json({
      success: true,
      message: "Sent invitations fetched successfully",
      data: {
        invitations,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetSentInvitations", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sent invitations",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Cancel a pending invitation (Recruiter only)
 */
const CancelInvitation = async (req, res) => {
  try {
    console.log("Hit CancelInvitation api...");
    const { id } = req.params;

    const invitation = await Invitation.findOne({
      _id: id,
      recruiterId: req.user._id,
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
        data: null,
        error: "INVITATION_NOT_FOUND",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an invitation that is already ${invitation.status}`,
        data: null,
        error: "CANNOT_CANCEL",
      });
    }

    invitation.status = "cancelled";
    await invitation.save();

    return res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
      data: invitation,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle CancelInvitation", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel invitation",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get invitations received by the authenticated candidate
 */
const GetCandidateInvitations = async (req, res) => {
  try {
    console.log("Hit GetCandidateInvitations api...");
    const { status, page = 1, limit = 20 } = req.query;

    const query = { candidateId: req.user._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Invitation.countDocuments(query);

    const invitations = await Invitation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "jobId",
        select:
          "title location workplaceType employmentType salaryRange status deadline",
      })
      .populate("companyId", "companyName logo location industry website")
      .populate("recruiterId", "name avatar");

    return res.status(200).json({
      success: true,
      message: "Candidate invitations fetched successfully",
      data: {
        invitations,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetCandidateInvitations", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your invitations",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Respond to an invitation (Candidate only: accept or decline)
 */
const RespondToInvitation = async (req, res) => {
  try {
    console.log("Hit RespondToInvitation api...");
    const { id } = req.params;
    let rawAction = req.body.action || req.body.response || req.body.status || "";
    rawAction = String(rawAction).toLowerCase().trim();

    let normalizedAction = "";
    if (rawAction === "accept" || rawAction === "accepted") {
      normalizedAction = "accept";
    } else if (rawAction === "decline" || rawAction === "declined") {
      normalizedAction = "decline";
    }

    if (!normalizedAction) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'accept' or 'decline'.",
        data: null,
        error: "INVALID_ACTION",
      });
    }

    const action = normalizedAction;

    const invitation = await Invitation.findOne({
      _id: id,
      candidateId: req.user._id,
    }).populate("jobId", "title _id");

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
        data: null,
        error: "INVITATION_NOT_FOUND",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status}`,
        data: null,
        error: "ALREADY_RESPONDED",
      });
    }

    invitation.status = action === "accept" ? "accepted" : "declined";
    invitation.respondedAt = new Date();
    await invitation.save();

    // Notify recruiter
    await Notification.create({
      recipientId: invitation.recruiterId,
      senderId: req.user._id,
      type: action === "accept" ? "INVITATION_ACCEPTED" : "INVITATION_DECLINED",
      title: `Candidate ${action === "accept" ? "Accepted" : "Declined"} Invitation`,
      message: `${req.user.name} has ${
        action === "accept" ? "accepted" : "declined"
      } your invitation to apply for "${invitation.jobId?.title || "Position"}".`,
      link: `/dashboard/recruiter/invitations`,
      metadata: {
        invitationId: invitation._id,
        jobId: invitation.jobId?._id,
        status: invitation.status,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Invitation ${invitation.status} successfully`,
      data: {
        invitation,
        jobId: invitation.jobId?._id,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle RespondToInvitation", error);
    return res.status(500).json({
      success: false,
      message: "Failed to respond to invitation",
      data: null,
      error: error.message,
    });
  }
};

export {
  SendInvitation,
  GetSentInvitations,
  CancelInvitation,
  GetCandidateInvitations,
  RespondToInvitation,
};
