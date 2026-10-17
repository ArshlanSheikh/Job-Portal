import Recruiter from "./recruiter.model.js";
import User from "../auth/auth.model.js";
import Company from "../companies/company.model.js";

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

export {
  GetMyRecruiterProfile,
  UpdateMyRecruiterProfile,
  UploadRecruiterPhoto,
  GetRecruiterById,
};
