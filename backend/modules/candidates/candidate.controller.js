import Candidate from "./candidate.model.js";
import User from "../auth/auth.model.js";

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
      candidate = new Candidate({ userId: req.user._id });
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

    const host = req.get("host");
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/resumes/${req.file.filename}`;

    candidate.resume = {
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
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

    candidate.resume = {
      fileName: "",
      fileUrl: "",
      fileSize: 0,
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

export {
  GetMyCandidateProfile,
  GetCandidateById,
  UpdateCandidateProfile,
  UploadCandidateResume,
  UploadCandidatePhoto,
  DeleteCandidateResume,
};
