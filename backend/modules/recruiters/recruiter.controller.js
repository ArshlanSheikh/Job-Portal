import Recruiter from "./recruiter.model.js";
import User from "../auth/auth.model.js";
import Company from "../companies/company.model.js";
import Job from "../jobs/job.model.js";
import Application from "../applications/application.model.js";
import Invitation from "../invitations/invitation.model.js";
import Candidate from "../candidates/candidate.model.js";

/**
 * Get authenticated recruiter's profile
 */
const GetMyRecruiterProfile = async (req, res) => {
  try {
    console.log("Hit GetMyRecruiterProfile api...");
    let recruiter = await Recruiter.findOne({ userId: req.user._id }).populate(
      "company",
      "companyName logo industry location website"
    );

    if (!recruiter) {
      recruiter = await Recruiter.create({
        userId: req.user._id,
        fullName: req.user.name,
        contactPhone: req.user.phone || "",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recruiter profile fetched successfully",
      data: recruiter,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetMyRecruiterProfile", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve recruiter profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Update authenticated recruiter's profile
 */
const UpdateMyRecruiterProfile = async (req, res) => {
  try {
    console.log("Hit UpdateMyRecruiterProfile api...");
    const incomingData = req.body;

    let recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) {
      recruiter = new Recruiter({ userId: req.user._id });
    }

    const updatableFields = [
      "fullName",
      "profilePhoto",
      "jobTitle",
      "contactPhone",
      "company",
      "companyName",
      "department",
      "professionalBio",
      "linkedinUrl",
    ];

    updatableFields.forEach((field) => {
      if (incomingData[field] !== undefined) {
        recruiter[field] = incomingData[field];
      }
    });

    // If company ID was passed, verify company exists and sync name
    if (incomingData.company) {
      const company = await Company.findById(incomingData.company);
      if (company) {
        recruiter.company = company._id;
        recruiter.companyName = company.companyName;
      }
    }

    if (incomingData.fullName) {
      recruiter.fullName = incomingData.fullName.trim();
      await User.findByIdAndUpdate(req.user._id, { name: recruiter.fullName });
    }

    if (incomingData.contactPhone) {
      recruiter.contactPhone = incomingData.contactPhone.trim();
      await User.findByIdAndUpdate(req.user._id, { phone: recruiter.contactPhone });
    }

    if (incomingData.profilePhoto) {
      await User.findByIdAndUpdate(req.user._id, { avatar: incomingData.profilePhoto });
    }

    await recruiter.save();

    const updatedProfile = await Recruiter.findById(recruiter._id).populate(
      "company",
      "companyName logo industry location website"
    );

    return res.status(200).json({
      success: true,
      message: "Recruiter profile updated successfully",
      data: updatedProfile,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UpdateMyRecruiterProfile", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update recruiter profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Upload recruiter profile photo
 */
const UploadRecruiterPhoto = async (req, res) => {
  try {
    console.log("Hit UploadRecruiterPhoto api...");
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
        data: null,
        error: "NO_FILE_PROVIDED",
      });
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const photoUrl = `${protocol}://${host}/uploads/images/${req.file.filename}`;

    let recruiter = await Recruiter.findOne({ userId: req.user._id });
    if (!recruiter) {
      recruiter = new Recruiter({ userId: req.user._id });
    }

    recruiter.profilePhoto = photoUrl;
    await recruiter.save();

    await User.findByIdAndUpdate(req.user._id, { avatar: photoUrl });

    return res.status(200).json({
      success: true,
      message: "Photo uploaded successfully",
      data: { profilePhoto: photoUrl },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UploadRecruiterPhoto", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload photo",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get recruiter by ID
 */
const GetRecruiterById = async (req, res) => {
  try {
    console.log("Hit GetRecruiterById api...");
    const { id } = req.params;
    const recruiter = await Recruiter.findById(id)
      .populate("userId", "name email avatar")
      .populate("company", "companyName logo industry website");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
        data: null,
        error: "RECRUITER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Recruiter details fetched successfully",
      data: recruiter,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetRecruiterById", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter details",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Comprehensive Recruiter Dashboard endpoint
 * Provides total openings, active/closed breakdown, applications awaiting review,
 * shortlisted candidates, interview updates, invitations sent, and recent candidates.
 */
const GetRecruiterDashboard = async (req, res) => {
  try {
    console.log("Hit GetRecruiterDashboard api...");
    let recruiter = await Recruiter.findOne({ userId: req.user._id }).populate(
      "company",
      "companyName logo industry location website"
    );

    if (!recruiter) {
      recruiter = await Recruiter.create({
        userId: req.user._id,
        fullName: req.user.name,
        contactPhone: req.user.phone || "",
      });
    }

    const companyId = recruiter.company?._id;

    // Define scopes
    let jobQuery = {};
    let appQuery = {};
    let invQuery = {};

    if (companyId) {
      jobQuery = { company: companyId };
      appQuery = { companyId: companyId };
      invQuery = { companyId: companyId };
    } else {
      jobQuery = { createdBy: req.user._id };
      const myJobs = await Job.find({ createdBy: req.user._id }).select("_id");
      const jobIds = myJobs.map((j) => j._id);
      appQuery = { jobId: { $in: jobIds } };
      invQuery = { recruiterId: req.user._id };
    }

    // 1. Job Statistics
    const [
      totalJobs,
      activeJobs,
      closedJobs,
      draftJobs,
    ] = await Promise.all([
      Job.countDocuments(jobQuery),
      Job.countDocuments({ ...jobQuery, status: "published" }),
      Job.countDocuments({ ...jobQuery, status: "closed" }),
      Job.countDocuments({ ...jobQuery, status: "draft" }),
    ]);

    // 2. Application Pipeline Statistics
    const [
      totalApplications,
      awaitingReviewApplications,
      underReviewApplications,
      shortlistedApplications,
      interviewApplications,
      offeredApplications,
      hiredApplications,
      rejectedApplications,
    ] = await Promise.all([
      Application.countDocuments(appQuery),
      Application.countDocuments({ ...appQuery, status: "Applied" }),
      Application.countDocuments({ ...appQuery, status: "Under Review" }),
      Application.countDocuments({ ...appQuery, status: "Shortlisted" }),
      Application.countDocuments({ ...appQuery, status: "Interview" }),
      Application.countDocuments({ ...appQuery, status: "Offered" }),
      Application.countDocuments({ ...appQuery, status: "Hired" }),
      Application.countDocuments({ ...appQuery, status: "Rejected" }),
    ]);

    // 3. Invitation Metrics
    const [
      totalInvitations,
      pendingInvitations,
      acceptedInvitations,
      declinedInvitations,
    ] = await Promise.all([
      Invitation.countDocuments(invQuery),
      Invitation.countDocuments({ ...invQuery, status: "pending" }),
      Invitation.countDocuments({ ...invQuery, status: "accepted" }),
      Invitation.countDocuments({ ...invQuery, status: "declined" }),
    ]);

    // 4. Recent Applications
    const recentApplications = await Application.find(appQuery)
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("jobId", "title location workplaceType employmentType")
      .populate("candidateId", "name email phone avatar");

    // Gather candidate profiles for quick preview
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

    // 5. Recent Job Openings
    const recentJobs = await Job.find(jobQuery)
      .sort({ createdAt: -1 })
      .limit(5);

    // 6. Recent Invitations Sent
    const recentInvitations = await Invitation.find(invQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("jobId", "title")
      .populate("candidateId", "name email");

    return res.status(200).json({
      success: true,
      message: "Recruiter dashboard retrieved successfully",
      data: {
        profile: recruiter,
        stats: {
          totalJobs,
          activeJobs,
          closedJobs,
          draftJobs,
          totalApplications,
          awaitingReviewApplications,
          underReviewApplications,
          shortlistedApplications,
          interviewApplications,
          offeredApplications,
          hiredApplications,
          rejectedApplications,
          totalInvitations,
          pendingInvitations,
          acceptedInvitations,
          declinedInvitations,
        },
        recentApplications: applicationsWithProfiles,
        recentJobs,
        recentInvitations,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetRecruiterDashboard", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load recruiter dashboard",
      data: null,
      error: error.message,
    });
  }
};

export {
  GetMyRecruiterProfile,
  UpdateMyRecruiterProfile,
  UploadRecruiterPhoto,
  GetRecruiterById,
  GetRecruiterDashboard,
};

