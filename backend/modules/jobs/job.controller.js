import Job from "./job.model.js";
import Company from "../companies/company.model.js";
import Recruiter from "../recruiters/recruiter.model.js";
import SavedJob from "../savedJobs/savedJob.model.js";

// Helper to determine the company associated with the user
const resolveUserCompany = async (user) => {
  if (user.role === "employer") {
    let company = await Company.findOne({ employerId: user._id });
    if (!company) {
      company = await Company.create({
        employerId: user._id,
        companyName: `${user.name}'s Company`,
      });
    }
    return company;
  }

  if (user.role === "recruiter") {
    const recruiter = await Recruiter.findOne({ userId: user._id });
    if (recruiter && recruiter.company) {
      const company = await Company.findById(recruiter.company);
      if (company) return company;
    }
  }

  return null;
};

/**
 * Create a new Job opening (Recruiter or Employer)
 */
const CreateJob = async (req, res) => {
  try {
    console.log("Hit CreateJob api...");
    const incomingData = req.body;

    const requiredFields = ["title", "description"];
    const missingFields = requiredFields.filter((item) => {
      return (
        incomingData[item] === null ||
        incomingData[item] === undefined ||
        incomingData[item] === ""
      );
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
        data: null,
        error: missingFields,
      });
    }

    let company = await resolveUserCompany(req.user);

    // If recruiter specified a companyId
    if (!company && req.body.companyId) {
      company = await Company.findById(req.body.companyId);
    }

    if (!company) {
      return res.status(400).json({
        success: false,
        message:
          "You must be associated with a registered company before creating job openings. Please update your profile or link a company first.",
        data: null,
        error: "NO_COMPANY_AFFILIATION",
      });
    }

    const {
      title,
      description,
      responsibilities = [],
      qualifications = [],
      skills = [],
      experienceRange = { min: 0, max: 5 },
      employmentType = "full-time",
      workplaceType = "hybrid",
      salaryRange = { min: 0, max: 0, currency: "USD", period: "yearly" },
      location = "",
      vacancies = 1,
      deadline = null,
      requiredEducation = "Bachelor's Degree or Equivalent",
      status = "published",
    } = incomingData;

    const newJob = await Job.create({
      title: title.trim(),
      company: company._id,
      createdBy: req.user._id,
      description: description.trim(),
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim())
        : [],
      experienceRange,
      employmentType,
      workplaceType,
      salaryRange,
      location: location ? location.trim() : company.location || "",
      vacancies: Number(vacancies) || 1,
      deadline: deadline ? new Date(deadline) : null,
      requiredEducation: requiredEducation.trim(),
      status,
    });

    const populatedJob = await Job.findById(newJob._id).populate(
      "company",
      "companyName logo industry location website"
    );

    return res.status(201).json({
      success: true,
      message: "Job opening created successfully",
      data: populatedJob,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle CreateJob", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job opening",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get all published jobs with search, filtering, and pagination
 */
const GetAllJobs = async (req, res) => {
  try {
    console.log("Hit GetAllJobs api...");
    const {
      search,
      location,
      workplaceType,
      employmentType,
      skills,
      minSalary,
      maxSalary,
      minExperience,
      maxExperience,
      sort = "recent",
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: "published" };

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { skills: { $in: [new RegExp(term, "i")] } },
      ];
    }

    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    if (workplaceType && workplaceType !== "all") {
      query.workplaceType = workplaceType;
    }

    if (employmentType && employmentType !== "all") {
      query.employmentType = employmentType;
    }

    if (skills) {
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

    if (minSalary && Number(minSalary) > 0) {
      query["salaryRange.max"] = { $gte: Number(minSalary) };
    }

    if (maxSalary && Number(maxSalary) > 0) {
      query["salaryRange.min"] = { $lte: Number(maxSalary) };
    }

    if (minExperience !== undefined && minExperience !== "") {
      query["experienceRange.max"] = { $gte: Number(minExperience) };
    }

    if (maxExperience !== undefined && maxExperience !== "") {
      query["experienceRange.min"] = { $lte: Number(maxExperience) };
    }

    // Sort order
    let sortOptions = { createdAt: -1 };
    if (sort === "salary_high") {
      sortOptions = { "salaryRange.max": -1, createdAt: -1 };
    } else if (sort === "deadline") {
      sortOptions = { deadline: 1, createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("company", "companyName logo industry location website");

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: {
        jobs,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetAllJobs", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job listings",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get single job by ID
 */
const GetJobById = async (req, res) => {
  try {
    console.log("Hit GetJobById api...");
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate("company", "companyName logo industry location website description foundedYear")
      .populate("createdBy", "name avatar role");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found",
        data: null,
        error: "JOB_NOT_FOUND",
      });
    }

    let isSaved = false;
    if (req.user && req.user.role === "candidate") {
      const saved = await SavedJob.findOne({
        candidateId: req.user._id,
        jobId: job._id,
      });
      isSaved = Boolean(saved);
    }

    return res.status(200).json({
      success: true,
      message: "Job opening retrieved successfully",
      data: {
        job,
        isSaved,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetJobById", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get jobs created for the authenticated user's company (draft, published, closed)
 */
const GetMyCompanyJobs = async (req, res) => {
  try {
    console.log("Hit GetMyCompanyJobs api...");
    const company = await resolveUserCompany(req.user);

    if (!company) {
      return res.status(200).json({
        success: true,
        message: "No company associated with user",
        data: { jobs: [], total: 0 },
        error: null,
      });
    }

    const { status, page = 1, limit = 50 } = req.query;
    const query = { company: company._id };

    if (status && ["draft", "published", "closed"].includes(status)) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("company", "companyName logo location");

    return res.status(200).json({
      success: true,
      message: "Company jobs fetched successfully",
      data: {
        jobs,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetMyCompanyJobs", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve company jobs",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Update an existing job opening
 */
const UpdateJob = async (req, res) => {
  try {
    console.log("Hit UpdateJob api...");
    const { id } = req.params;
    const incomingData = req.body;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found",
        data: null,
        error: "JOB_NOT_FOUND",
      });
    }

    // Verify ownership / authority
    const company = await resolveUserCompany(req.user);
    const isCreator = job.createdBy.toString() === req.user._id.toString();
    const isCompanyAdmin =
      company && job.company.toString() === company._id.toString();

    if (!isCreator && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this job opening",
        data: null,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "responsibilities",
      "qualifications",
      "skills",
      "experienceRange",
      "employmentType",
      "workplaceType",
      "salaryRange",
      "location",
      "vacancies",
      "deadline",
      "requiredEducation",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (incomingData[field] !== undefined) {
        job[field] = incomingData[field];
      }
    });

    await job.save();

    const updatedJob = await Job.findById(job._id).populate(
      "company",
      "companyName logo industry location website"
    );

    return res.status(200).json({
      success: true,
      message: "Job opening updated successfully",
      data: updatedJob,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UpdateJob", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job opening",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Change status of a job opening (published, closed, draft)
 */
const ChangeJobStatus = async (req, res) => {
  try {
    console.log("Hit ChangeJobStatus api...");
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be draft, published, or closed.",
        data: null,
        error: "INVALID_STATUS",
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found",
        data: null,
        error: "JOB_NOT_FOUND",
      });
    }

    const company = await resolveUserCompany(req.user);
    const isCreator = job.createdBy.toString() === req.user._id.toString();
    const isCompanyAdmin =
      company && job.company.toString() === company._id.toString();

    if (!isCreator && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job status",
        data: null,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    job.status = status;
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${status}`,
      data: job,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle ChangeJobStatus", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change job status",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Delete a job opening
 */
const DeleteJob = async (req, res) => {
  try {
    console.log("Hit DeleteJob api...");
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found",
        data: null,
        error: "JOB_NOT_FOUND",
      });
    }

    const company = await resolveUserCompany(req.user);
    const isCreator = job.createdBy.toString() === req.user._id.toString();
    const isCompanyAdmin =
      company && job.company.toString() === company._id.toString();

    if (!isCreator && !isCompanyAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job opening",
        data: null,
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    await Job.findByIdAndDelete(id);
    await SavedJob.deleteMany({ jobId: id });

    return res.status(200).json({
      success: true,
      message: "Job opening deleted successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle DeleteJob", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job opening",
      data: null,
      error: error.message,
    });
  }
};

export {
  CreateJob,
  GetAllJobs,
  GetJobById,
  GetMyCompanyJobs,
  UpdateJob,
  ChangeJobStatus,
  DeleteJob,
};
