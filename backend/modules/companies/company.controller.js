import Company from "./company.model.js";

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

export {
  GetMyCompanyProfile,
  UpdateMyCompanyProfile,
  UploadCompanyLogo,
  GetAllCompanies,
  GetCompanyById,
};
