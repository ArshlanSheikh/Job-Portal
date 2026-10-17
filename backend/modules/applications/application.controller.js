import Application from "./application.model.js";
import Job from "../jobs/job.model.js";
import Candidate from "../candidates/candidate.model.js";
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
 * Apply to a published job (Candidate only)
 */
const ApplyToJob = async (req, res) => {
  try {
    console.log("Hit ApplyToJob api...");
    const { jobId, coverLetter = "", useProfileResume = true } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required to apply",
        data: null,
        error: "JOB_ID_REQUIRED",
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

    if (job.status !== "published") {
      return res.status(400).json({
        success: false,
        message: `This job is ${job.status} and is no longer accepting applications`,
        data: null,
        error: "JOB_NOT_ACCEPTING_APPLICATIONS",
      });
    }

    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "The application deadline for this position has passed",
        data: null,
        error: "DEADLINE_PASSED",
      });
    }

    // Check duplicate application
    const existing = await Application.findOne({
      jobId,
      candidateId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted an application for this position",
        data: existing,
        error: "DUPLICATE_APPLICATION",
      });
    }

    // Determine Resume
    let resumeData = null;

    if (req.file) {
      const host = req.get("host");
      const protocol = req.protocol;
      resumeData = {
        fileName: req.file.originalname,
        fileUrl: `${protocol}://${host}/uploads/resumes/${req.file.filename}`,
        fileSize: req.file.size,
        uploadedAt: new Date(),
      };
    } else {
      // Use profile resume
      const candidateProfile = await Candidate.findOne({ userId: req.user._id });
      if (
        candidateProfile &&
        candidateProfile.resume &&
        candidateProfile.resume.fileUrl
      ) {
        resumeData = candidateProfile.resume;
      }
    }

    if (!resumeData || !resumeData.fileUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a resume file or add one to your candidate profile before applying",
        data: null,
        error: "RESUME_REQUIRED",
      });
    }

    // Create Application
    const application = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      companyId: job.company,
      resume: resumeData,
      coverLetter: coverLetter ? coverLetter.trim() : "",
      status: "Applied",
      statusHistory: [
        {
          status: "Applied",
          changedBy: req.user._id,
          note: "Application submitted by candidate",
          changedAt: new Date(),
        },
      ],
    });

    // Increment applicant count on job
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantCount: 1 } });

    // Notify job creator / employer
    await Notification.create({
      recipientId: job.createdBy,
      senderId: req.user._id,
      type: "APPLICATION_SUBMITTED",
      title: "New Job Application Received",
      message: `${req.user.name} applied for "${job.title}"`,
      link: `/dashboard/recruiter/applications?jobId=${job._id}`,
      metadata: { jobId: job._id, applicationId: application._id },
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle ApplyToJob", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit job application",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get all applications submitted by authenticated candidate
 */
const GetCandidateApplications = async (req, res) => {
  try {
    console.log("Hit GetCandidateApplications api...");
    const { status, page = 1, limit = 20 } = req.query;

    const query = { candidateId: req.user._id };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "jobId",
        select:
          "title location workplaceType employmentType salaryRange status deadline",
      })
      .populate("companyId", "companyName logo location industry");

    return res.status(200).json({
      success: true,
      message: "Candidate applications fetched successfully",
      data: {
        applications,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetCandidateApplications", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your applications",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Withdraw application by candidate
 */
const WithdrawApplication = async (req, res) => {
  try {
    console.log("Hit WithdrawApplication api...");
    const { id } = req.params;
    const { reason = "" } = req.body;

    const application = await Application.findOne({
      _id: id,
      candidateId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
        data: null,
        error: "APPLICATION_NOT_FOUND",
      });
    }

    if (["Hired", "Withdrawn"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw an application that is already ${application.status}`,
        data: null,
        error: "CANNOT_WITHDRAW",
      });
    }

    application.status = "Withdrawn";
    application.withdrawnReason = reason ? reason.trim() : "";
    application.statusHistory.push({
      status: "Withdrawn",
      changedBy: req.user._id,
      note: reason ? `Candidate withdrew application: ${reason}` : "Candidate withdrew application",
      changedAt: new Date(),
    });

    await application.save();

    // Decrement applicant count
    await Job.findByIdAndUpdate(application.jobId, {
      $inc: { applicantCount: -1 },
    });

    return res.status(200).json({
      success: true,
      message: "Application withdrawn successfully",
      data: application,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle WithdrawApplication", error);
    return res.status(500).json({
      success: false,
      message: "Failed to withdraw application",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get applications for a specific job (Recruiter or Employer)
 */
const GetJobApplications = async (req, res) => {
  try {
    console.log("Hit GetJobApplications api...");
    const { jobId } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found",
        data: null,
        error: "JOB_NOT_FOUND",
      });
    }

    // Verify authority
    const company = await resolveUserCompany(req.user);
    const isCreator = job.createdBy.toString() === req.user._id.toString();
    const isCompanyAdmin =
      company && job.company.toString() === company._id.toString();

    if (!isCreator && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view applications for this job",
        data: null,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const query = { jobId };
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("candidateId", "name email phone avatar");

    // Gather candidate profiles for quick screening
    const candidateUserIds = applications.map((a) => a.candidateId?._id);
    const candidateProfiles = await Candidate.find({
      userId: { $in: candidateUserIds },
    });
    const profileMap = {};
    candidateProfiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const applicationsWithProfiles = applications.map((app) => {
      const plain = app.toObject();
      plain.candidateProfile = plain.candidateId
        ? profileMap[plain.candidateId._id.toString()] || null
        : null;
      return plain;
    });

    return res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: {
        job,
        applications: applicationsWithProfiles,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetJobApplications", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve job applications",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get all applications across all company jobs (Recruiter or Employer)
 */
const GetRecruiterAllApplications = async (req, res) => {
  try {
    console.log("Hit GetRecruiterAllApplications api...");
    const company = await resolveUserCompany(req.user);

    if (!company) {
      return res.status(200).json({
        success: true,
        message: "No company associated with user",
        data: { applications: [], total: 0 },
        error: null,
      });
    }

    const { status, page = 1, limit = 50 } = req.query;
    const query = { companyId: company._id };

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Application.countDocuments(query);

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("jobId", "title location workplaceType employmentType")
      .populate("candidateId", "name email phone avatar");

    // Also get candidate profiles for screening
    const candidateUserIds = applications.map((a) => a.candidateId?._id);
    const candidateProfiles = await Candidate.find({
      userId: { $in: candidateUserIds },
    });
    const profileMap = {};
    candidateProfiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const applicationsWithProfiles = applications.map((app) => {
      const plain = app.toObject();
      plain.candidateProfile = plain.candidateId
        ? profileMap[plain.candidateId._id.toString()] || null
        : null;
      return plain;
    });

    return res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: {
        applications: applicationsWithProfiles,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetRecruiterAllApplications", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve applications",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get single application by ID
 */
const GetApplicationById = async (req, res) => {
  try {
    console.log("Hit GetApplicationById api...");
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate("jobId")
      .populate("companyId", "companyName logo location industry website")
      .populate("candidateId", "name email phone avatar")
      .populate("statusHistory.changedBy", "name role");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
        data: null,
        error: "APPLICATION_NOT_FOUND",
      });
    }

    // Verify authority: must be applicant or company manager
    const isApplicant =
      application.candidateId._id.toString() === req.user._id.toString();
    const company = await resolveUserCompany(req.user);
    const isCompanyStaff =
      company &&
      application.companyId._id.toString() === company._id.toString();

    if (!isApplicant && !isCompanyStaff) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this application",
        data: null,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const candidateProfile = await Candidate.findOne({
      userId: application.candidateId._id,
    });

    return res.status(200).json({
      success: true,
      message: "Application details retrieved successfully",
      data: {
        application,
        candidateProfile,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetApplicationById", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch application details",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Update application status (Recruiter or Employer only)
 */
const UpdateApplicationStatus = async (req, res) => {
  try {
    console.log("Hit UpdateApplicationStatus api...");
    const { id } = req.params;
    const { status, note = "", recruiterNotes } = req.body;

    const statusMap = {
      "applied": "Applied",
      "under review": "Under Review",
      "under_review": "Under Review",
      "shortlisted": "Shortlisted",
      "interview": "Interview",
      "offered": "Offered",
      "hired": "Hired",
      "rejected": "Rejected",
      "withdrawn": "Withdrawn",
    };

    const normalizedStatus =
      statusMap[String(status || "").toLowerCase().replace(/_/g, " ")] ||
      statusMap[String(status || "").toLowerCase()] ||
      status;

    const allowedStatuses = [
      "Under Review",
      "Shortlisted",
      "Interview",
      "Offered",
      "Hired",
      "Rejected",
    ];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed transitions: ${allowedStatuses.join(", ")}`,
        data: null,
        error: "INVALID_STATUS",
      });
    }

    const application = await Application.findById(id).populate("jobId", "title");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
        data: null,
        error: "APPLICATION_NOT_FOUND",
      });
    }

    // Verify authority
    const company = await resolveUserCompany(req.user);
    if (!company || application.companyId.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to change application status for this organization",
        data: null,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    application.status = normalizedStatus;
    if (recruiterNotes !== undefined) {
      application.recruiterNotes = recruiterNotes.trim();
    }

    application.statusHistory.push({
      status: normalizedStatus,
      changedBy: req.user._id,
      note: note ? note.trim() : `Status transitioned to ${normalizedStatus}`,
      changedAt: new Date(),
    });

    await application.save();

    // Create In-App Notification for candidate
    await Notification.create({
      recipientId: application.candidateId,
      senderId: req.user._id,
      type: "APPLICATION_STATUS_UPDATED",
      title: "Application Status Updated",
      message: `Your application for "${application.jobId?.title || "Position"}" is now "${status}".`,
      link: `/applications`,
      metadata: { applicationId: application._id, newStatus: status },
    });

    return res.status(200).json({
      success: true,
      message: `Application status updated to "${status}"`,
      data: application,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UpdateApplicationStatus", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
      data: null,
      error: error.message,
    });
  }
};

export {
  ApplyToJob,
  GetCandidateApplications,
  WithdrawApplication,
  GetJobApplications,
  GetRecruiterAllApplications,
  GetApplicationById,
  UpdateApplicationStatus,
};
