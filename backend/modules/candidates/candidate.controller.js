import Candidate from "./candidate.model.js";
import User from "../auth/auth.model.js";
import Job from "../jobs/job.model.js";
import Application from "../applications/application.model.js";
import SavedJob from "../savedJobs/savedJob.model.js";
import Invitation from "../invitations/invitation.model.js";
import Notification from "../notifications/notification.model.js";
import { uploadResumeToCloudinary, deleteResumeFromCloudinary } from "../../config/cloudinary.js";


/**
 * Get the authenticated candidate's profile
 */
const GetMyCandidateProfile = async (req, res) => {
  try {
    console.log("Hit GetMyCandidateProfile api...");
    let candidate = await Candidate.findOne({ userId: req.user._id });

    if (!candidate) {
      // Auto-create initial profile if not yet created
      candidate = await Candidate.create({
        userId: req.user._id,
        fullName: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "",
      });
    }

    candidate.calculateCompletion();
    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Candidate profile fetched successfully",
      data: candidate,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetMyCandidateProfile", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve candidate profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get candidate profile by ID (accessible by candidate, recruiters, employers)
 */
const GetCandidateById = async (req, res) => {
  try {
    console.log("Hit GetCandidateById api...");
    const { id } = req.params;
    const candidate = await Candidate.findById(id).populate("userId", "name email phone avatar");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
        data: null,
        error: "CANDIDATE_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Candidate profile fetched successfully",
      data: candidate,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetCandidateById", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch candidate details",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Update candidate profile
 */
const UpdateCandidateProfile = async (req, res) => {
  try {
    console.log("Hit UpdateCandidateProfile api...");
    const incomingData = req.body;

    let candidate = await Candidate.findOne({ userId: req.user._id });

    if (!candidate) {
      candidate = new Candidate({
        userId: req.user._id,
        fullName: req.user.name || "",
        email: req.user.email || "",
      });
    } else if (!candidate.fullName && req.user.name) {
      candidate.fullName = req.user.name;
    }

    // Update allowed fields
    const updatableFields = [
      "fullName",
      "phone",
      "headline",
      "currentLocation",
      "skills",
      "education",
      "experience",
      "projects",
      "summary",
      "preferredRoles",
      "preferredLocations",
      "expectedSalary",
      "profilePhoto",
      "resume",
    ];

    updatableFields.forEach((field) => {
      if (incomingData[field] !== undefined) {
        candidate[field] = incomingData[field];
      }
    });

    if (incomingData.fullName) {
      candidate.fullName = incomingData.fullName.trim();
      // Keep User model in sync
      await User.findByIdAndUpdate(req.user._id, { name: candidate.fullName });
    }

    if (incomingData.phone) {
      candidate.phone = incomingData.phone.trim();
      await User.findByIdAndUpdate(req.user._id, { phone: candidate.phone });
    }

    if (incomingData.profilePhoto) {
      await User.findByIdAndUpdate(req.user._id, { avatar: incomingData.profilePhoto });
    }

    candidate.calculateCompletion();
    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Candidate profile updated successfully",
      data: candidate,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UpdateCandidateProfile", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update candidate profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Upload candidate resume file
 */
const UploadCandidateResume = async (req, res) => {
  try {
    console.log("Hit UploadCandidateResume api...");
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No resume file was uploaded",
        data: null,
        error: "NO_FILE_PROVIDED",
      });
    }

    let candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      candidate = new Candidate({ userId: req.user._id });
    }

    // Upload directly to Cloudinary
    const uploadResult = await uploadResumeToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // If candidate had a previous resume in Cloudinary, delete it
    if (candidate.resume && candidate.resume.publicId) {
      deleteResumeFromCloudinary(candidate.resume.publicId, candidate.resume.format).catch((err) =>
        console.error("Failed to delete previous Cloudinary resume:", err)
      );
    }

    candidate.resume = {
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url || uploadResult.url,
      fileSize: req.file.size || uploadResult.bytes || 0,
      publicId: uploadResult.public_id || "",
      format: uploadResult.format || "",
      uploadedAt: new Date(),
    };

    candidate.calculateCompletion();
    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        resume: candidate.resume,
        completionPercentage: candidate.completionPercentage,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UploadCandidateResume", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload resume file",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Upload candidate profile photo
 */
const UploadCandidatePhoto = async (req, res) => {
  try {
    console.log("Hit UploadCandidatePhoto api...");
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file was uploaded",
        data: null,
        error: "NO_FILE_PROVIDED",
      });
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const photoUrl = `${protocol}://${host}/uploads/images/${req.file.filename}`;

    let candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      candidate = new Candidate({ userId: req.user._id });
    }

    candidate.profilePhoto = photoUrl;
    candidate.calculateCompletion();
    await candidate.save();

    await User.findByIdAndUpdate(req.user._id, { avatar: photoUrl });

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        profilePhoto: photoUrl,
        completionPercentage: candidate.completionPercentage,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UploadCandidatePhoto", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Remove candidate resume
 */
const DeleteCandidateResume = async (req, res) => {
  try {
    console.log("Hit DeleteCandidateResume api...");
    let candidate = await Candidate.findOne({ userId: req.user._id });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
        data: null,
        error: "CANDIDATE_NOT_FOUND",
      });
    }

    if (candidate.resume && candidate.resume.publicId) {
      await deleteResumeFromCloudinary(candidate.resume.publicId, candidate.resume.format);
    }

    candidate.resume = {
      fileName: "",
      fileUrl: "",
      fileSize: 0,
      publicId: "",
      format: "",
      uploadedAt: null,
    };

    candidate.calculateCompletion();
    await candidate.save();

    return res.status(200).json({
      success: true,
      message: "Resume removed successfully",
      data: candidate,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle DeleteCandidateResume", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove resume",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Search and discover candidates (Recruiters & Employers only)
 */
const SearchCandidates = async (req, res) => {
  try {
    console.log("Hit SearchCandidates api...");
    const { search, skills, role, location, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { fullName: { $regex: term, $options: "i" } },
        { headline: { $regex: term, $options: "i" } },
        { summary: { $regex: term, $options: "i" } },
        { skills: { $in: [new RegExp(term, "i")] } },
      ];
    }

    if (skills && skills.trim()) {
      const skillList = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillList.length > 0) {
        query.skills = {
          $in: skillList.map((s) => new RegExp(`^${s}$`, "i")),
        };
      }
    }

    if (role && role.trim()) {
      query.$or = [
        ...(query.$or || []),
        { headline: { $regex: role.trim(), $options: "i" } },
        { preferredRoles: { $in: [new RegExp(role.trim(), "i")] } },
      ];
    }

    if (location && location.trim()) {
      query.$or = [
        ...(query.$or || []),
        { currentLocation: { $regex: location.trim(), $options: "i" } },
        { preferredLocations: { $in: [new RegExp(location.trim(), "i")] } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Candidate.countDocuments(query);
    const candidates = await Candidate.find(query)
      .sort({ completionPercentage: -1, updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email avatar")
      .select(
        "userId fullName profilePhoto headline currentLocation skills experience education preferredRoles preferredLocations expectedSalary completionPercentage"
      );

    return res.status(200).json({
      success: true,
      message: "Candidates discovered successfully",
      data: {
        candidates,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle SearchCandidates", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search candidates",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Detailed candidate profile view for authorized recruiters and employers
 */
const GetCandidateDetailsForRecruiter = async (req, res) => {
  try {
    console.log("Hit GetCandidateDetailsForRecruiter api...");
    const { id } = req.params;

    const candidate = await Candidate.findById(id).populate(
      "userId",
      "name email phone avatar"
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found",
        data: null,
        error: "CANDIDATE_NOT_FOUND",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Candidate profile retrieved for recruiting review",
      data: candidate,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetCandidateDetailsForRecruiter", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve candidate profile",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Comprehensive Candidate Dashboard endpoint
 * Provides profile stats, application breakdown, recommended & recent jobs,
 * invitations, and notifications in one efficient payload.
 */
const GetCandidateDashboard = async (req, res) => {
  try {
    console.log("Hit GetCandidateDashboard api...");
    let candidate = await Candidate.findOne({ userId: req.user._id });

    if (!candidate) {
      candidate = await Candidate.create({
        userId: req.user._id,
        fullName: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "",
      });
    }

    candidate.calculateCompletion();
    await candidate.save();

    // 1. Application Counts
    const [
      totalApplications,
      underReviewApplications,
      shortlistedApplications,
      interviewApplications,
      offerApplications,
      savedJobsCount,
      invitationsCount,
      unreadNotificationsCount,
    ] = await Promise.all([
      Application.countDocuments({ candidateId: req.user._id }),
      Application.countDocuments({
        candidateId: req.user._id,
        status: { $in: ["Applied", "Under Review"] },
      }),
      Application.countDocuments({
        candidateId: req.user._id,
        status: "Shortlisted",
      }),
      Application.countDocuments({
        candidateId: req.user._id,
        status: "Interview",
      }),
      Application.countDocuments({
        candidateId: req.user._id,
        status: { $in: ["Offered", "Hired"] },
      }),
      SavedJob.countDocuments({ candidateId: req.user._id }),
      Invitation.countDocuments({
        candidateId: req.user._id,
        status: "pending",
      }),
      Notification.countDocuments({
        recipientId: req.user._id,
        isRead: false,
      }),
    ]);

    // 2. Recommended Jobs (matched against candidate skills or preferences)
    let recommendedJobs = [];
    const skillList = candidate.skills || [];
    const preferredRoles = candidate.preferredRoles || [];

    const recQuery = { status: "published" };
    const orConditions = [];

    if (skillList.length > 0) {
      orConditions.push({ skills: { $in: skillList } });
    }
    if (preferredRoles.length > 0) {
      orConditions.push({ title: { $in: preferredRoles.map((r) => new RegExp(r, "i")) } });
    }
    if (candidate.currentLocation) {
      orConditions.push({ location: new RegExp(candidate.currentLocation, "i") });
    }

    if (orConditions.length > 0) {
      recQuery.$or = orConditions;
      recommendedJobs = await Job.find(recQuery)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate("company", "companyName logo location industry");
    }

    // If fewer than 4 matched jobs found, supplement with latest published jobs
    if (recommendedJobs.length < 4) {
      const existingIds = recommendedJobs.map((j) => j._id);
      const fillerJobs = await Job.find({
        status: "published",
        _id: { $nin: existingIds },
      })
        .sort({ createdAt: -1 })
        .limit(4 - recommendedJobs.length)
        .populate("company", "companyName logo location industry");

      recommendedJobs = [...recommendedJobs, ...fillerJobs];
    }

    // 3. Recent Job Openings (Platform-wide)
    const recentJobs = await Job.find({ status: "published" })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("company", "companyName logo location industry");

    // 4. Candidate's Recent Applications
    const recentApplications = await Application.find({ candidateId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("jobId", "title location workplaceType employmentType salaryRange status deadline")
      .populate("companyId", "companyName logo location industry");

    // 5. Recent Invitations
    const recentInvitations = await Invitation.find({ candidateId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("jobId", "title location workplaceType employmentType salaryRange status")
      .populate("companyId", "companyName logo location industry")
      .populate("recruiterId", "name email");

    // 6. Recent In-App Notifications
    const recentNotifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      message: "Candidate dashboard retrieved successfully",
      data: {
        profile: candidate,
        stats: {
          totalApplications,
          underReviewApplications,
          shortlistedApplications,
          interviewApplications,
          offerApplications,
          savedJobsCount,
          invitationsCount,
          unreadNotificationsCount,
        },
        recommendedJobs,
        recentJobs,
        recentApplications,
        recentInvitations,
        recentNotifications,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetCandidateDashboard", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load candidate dashboard",
      data: null,
      error: error.message,
    });
  }
};

export {
  GetMyCandidateProfile,
  GetCandidateById,
  UpdateCandidateProfile,
  UploadCandidateResume,
  UploadCandidatePhoto,
  DeleteCandidateResume,
  SearchCandidates,
  GetCandidateDetailsForRecruiter,
  GetCandidateDashboard,
};

