import Company from "./company.model.js";
import Job from "../jobs/job.model.js";
import Application from "../applications/application.model.js";
import Recruiter from "../recruiters/recruiter.model.js";
import Invitation from "../invitations/invitation.model.js";
import Candidate from "../candidates/candidate.model.js";

/**
 * Get company profile owned by authenticated employer
 */
const GetMyCompanyProfile = async (req, res) => {
  try {
    console.log("Hit GetMyCompanyProfile api...");
    let company = await Company.findOne({ employerId: req.user._id });

    if (!company) {
      company = await Company.create({
        employerId: req.user._id,
        companyName: `${req.user.name}'s Company`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company profile fetched successfully",
      data: company,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetMyCompanyProfile", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve company profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Update company profile for authenticated employer
 */
const UpdateMyCompanyProfile = async (req, res) => {
  try {
    console.log("Hit UpdateMyCompanyProfile api...");
    const incomingData = req.body;

    let company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      company = new Company({ employerId: req.user._id });
    }

    const updatableFields = [
      "companyName",
      "logo",
      "industry",
      "companySize",
      "website",
      "location",
      "description",
      "foundedYear",
      "socialLinks",
    ];

    updatableFields.forEach((field) => {
      if (incomingData[field] !== undefined) {
        company[field] = incomingData[field];
      }
    });

    if (incomingData.companyName && !incomingData.companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name cannot be empty",
        data: null,
        error: "COMPANY_NAME_REQUIRED",
      });
    }

    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      data: company,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UpdateMyCompanyProfile", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update company profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Upload company logo
 */
const UploadCompanyLogo = async (req, res) => {
  try {
    console.log("Hit UploadCompanyLogo api...");
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo image file was provided",
        data: null,
        error: "NO_FILE_PROVIDED",
      });
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const logoUrl = `${protocol}://${host}/uploads/images/${req.file.filename}`;

    let company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      company = new Company({
        employerId: req.user._id,
        companyName: `${req.user.name}'s Company`,
      });
    }

    company.logo = logoUrl;
    await company.save();

    return res.status(200).json({
      success: true,
      message: "Company logo uploaded successfully",
      data: { logo: logoUrl },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UploadCompanyLogo", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload company logo",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get all companies (with search support)
 */
const GetAllCompanies = async (req, res) => {
  try {
    console.log("Hit GetAllCompanies api...");
    const { search, limit = 20, page = 1 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("companyName logo industry companySize location website description");

    return res.status(200).json({
      success: true,
      message: "Companies fetched successfully",
      data: {
        companies,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetAllCompanies", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies list",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get company by ID
 */
const GetCompanyById = async (req, res) => {
  try {
    console.log("Hit GetCompanyById api...");
    const { id } = req.params;
    const company = await Company.findById(id).populate("employerId", "name email");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
        data: null,
        error: "COMPANY_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company profile fetched successfully",
      data: company,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetCompanyById", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Comprehensive Employer Dashboard endpoint
 * Provides company profile, organization job statistics, full application pipeline
 * breakdown, affiliated recruiters list, and recent recruitment activity.
 */
const GetEmployerDashboard = async (req, res) => {
  try {
    console.log("Hit GetEmployerDashboard api...");
    let company = await Company.findOne({ employerId: req.user._id });

    if (!company) {
      company = await Company.create({
        employerId: req.user._id,
        companyName: `${req.user.name}'s Company`,
      });
    }

    const companyId = company._id;

    // 1. Company Job Statistics
    const [
      totalJobs,
      activeJobs,
      closedJobs,
      draftJobs,
    ] = await Promise.all([
      Job.countDocuments({ company: companyId }),
      Job.countDocuments({ company: companyId, status: "published" }),
      Job.countDocuments({ company: companyId, status: "closed" }),
      Job.countDocuments({ company: companyId, status: "draft" }),
    ]);

    // 2. Application Pipeline Statistics
    const [
      totalApplications,
      appliedCount,
      underReviewCount,
      shortlistedCount,
      interviewCount,
      offeredCount,
      hiredCount,
      rejectedCount,
      withdrawnCount,
    ] = await Promise.all([
      Application.countDocuments({ companyId }),
      Application.countDocuments({ companyId, status: "Applied" }),
      Application.countDocuments({ companyId, status: "Under Review" }),
      Application.countDocuments({ companyId, status: "Shortlisted" }),
      Application.countDocuments({ companyId, status: "Interview" }),
      Application.countDocuments({ companyId, status: "Offered" }),
      Application.countDocuments({ companyId, status: "Hired" }),
      Application.countDocuments({ companyId, status: "Rejected" }),
      Application.countDocuments({ companyId, status: "Withdrawn" }),
    ]);

    // 3. Authorized / Affiliated Recruiters
    const recruiters = await Recruiter.find({ company: companyId })
      .populate("userId", "name email phone avatar createdAt");

    // 4. Invitation Metrics
    const [
      totalInvitationsSent,
      pendingInvitations,
      acceptedInvitations,
      declinedInvitations,
    ] = await Promise.all([
      Invitation.countDocuments({ companyId }),
      Invitation.countDocuments({ companyId, status: "pending" }),
      Invitation.countDocuments({ companyId, status: "accepted" }),
      Invitation.countDocuments({ companyId, status: "declined" }),
    ]);

    // 5. Recent Job Openings
    const recentJobs = await Job.find({ company: companyId })
      .sort({ createdAt: -1 })
      .limit(6);

    // 6. Recent Organization Applications
    const recentApplications = await Application.find({ companyId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("jobId", "title location workplaceType employmentType")
      .populate("candidateId", "name email phone avatar");

    const candidateUserIds = recentApplications.map((a) => a.candidateId?._id).filter(Boolean);
    const candidateProfiles = await Candidate.find({ userId: { $in: candidateUserIds } });
    const profileMap = {};
    candidateProfiles.forEach((p) => {
      profileMap[p.userId.toString()] = p;
    });

    const applicationsWithProfiles = recentApplications.map((app) => {
      const plain = app.toObject();
      plain.candidateProfile = plain.candidateId
        ? profileMap[plain.candidateId._id.toString()] || null
        : null;
      return plain;
    });

    return res.status(200).json({
      success: true,
      message: "Employer dashboard retrieved successfully",
      data: {
        company,
        stats: {
          totalJobs,
          activeJobs,
          closedJobs,
          draftJobs,
          totalApplications,
          appliedCount,
          underReviewCount,
          shortlistedCount,
          interviewCount,
          offeredCount,
          hiredCount,
          rejectedCount,
          withdrawnCount,
          affiliatedRecruitersCount: recruiters.length,
          totalInvitationsSent,
          pendingInvitations,
          acceptedInvitations,
          declinedInvitations,
        },
        recruiters,
        recentJobs,
        recentApplications: applicationsWithProfiles,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetEmployerDashboard", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load employer dashboard",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get all recruiters affiliated with authenticated employer's company
 */
const GetCompanyRecruiters = async (req, res) => {
  try {
    console.log("Hit GetCompanyRecruiters api...");
    const company = await Company.findOne({ employerId: req.user._id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "No company registered for this employer",
        data: null,
        error: "COMPANY_NOT_FOUND",
      });
    }

    const recruiters = await Recruiter.find({ company: company._id })
      .populate("userId", "name email phone avatar createdAt");

    return res.status(200).json({
      success: true,
      message: "Company recruiters fetched successfully",
      data: { recruiters, total: recruiters.length },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetCompanyRecruiters", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch company recruiters",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Revoke recruiter authorization from authenticated employer's company
 */
const RemoveCompanyRecruiter = async (req, res) => {
  try {
    console.log("Hit RemoveCompanyRecruiter api...");
    const { recruiterId } = req.params;

    const company = await Company.findOne({ employerId: req.user._id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
        data: null,
        error: "COMPANY_NOT_FOUND",
      });
    }

    const recruiter = await Recruiter.findOne({
      _id: recruiterId,
      company: company._id,
    });

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found or not affiliated with your company",
        data: null,
        error: "RECRUITER_NOT_AFFILIATED",
      });
    }

    recruiter.company = null;
    recruiter.companyName = "";
    await recruiter.save();

    return res.status(200).json({
      success: true,
      message: `Recruiter authorization for ${recruiter.fullName || "recruiter"} has been removed`,
      data: recruiter,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle RemoveCompanyRecruiter", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove recruiter authorization",
      data: null,
      error: error.message,
    });
  }
};

export {
  GetMyCompanyProfile,
  UpdateMyCompanyProfile,
  UploadCompanyLogo,
  GetAllCompanies,
  GetCompanyById,
  GetEmployerDashboard,
  GetCompanyRecruiters,
  RemoveCompanyRecruiter,
};

