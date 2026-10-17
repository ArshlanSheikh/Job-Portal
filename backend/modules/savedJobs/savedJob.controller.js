import SavedJob from "./savedJob.model.js";
import Job from "../jobs/job.model.js";

/**
 * Save / Bookmark a job
 */
const SaveJob = async (req, res) => {
  try {
    console.log("Hit SaveJob api...");
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job opening not found",
        data: null,
        error: "JOB_NOT_FOUND",
      });
    }

    const existing = await SavedJob.findOne({
      candidateId: req.user._id,
      jobId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Job is already saved",
        data: existing,
        error: null,
      });
    }

    const saved = await SavedJob.create({
      candidateId: req.user._id,
      jobId,
    });

    return res.status(201).json({
      success: true,
      message: "Job saved to your bookmarks",
      data: saved,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle SaveJob", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save job opening",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Unsave / Remove bookmark
 */
const UnsaveJob = async (req, res) => {
  try {
    console.log("Hit UnsaveJob api...");
    const { jobId } = req.params;

    await SavedJob.findOneAndDelete({
      candidateId: req.user._id,
      jobId,
    });

    return res.status(200).json({
      success: true,
      message: "Job removed from bookmarks",
      data: null,
      error: null,
    });
  } catch (error) {
    console.log("failed to handle UnsaveJob", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove saved job",
      data: null,
      error: error.message,
    });
  }
};

/**
 * Get all saved jobs for authenticated candidate
 */
const GetMySavedJobs = async (req, res) => {
  try {
    console.log("Hit GetMySavedJobs api...");
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { candidateId: req.user._id };
    const total = await SavedJob.countDocuments(query);

    const savedJobs = await SavedJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: "jobId",
        populate: {
          path: "company",
          select: "companyName logo industry location",
        },
      });

    // Filter out jobs that might have been deleted
    const validSavedJobs = savedJobs.filter((sj) => sj.jobId !== null);

    return res.status(200).json({
      success: true,
      message: "Saved jobs fetched successfully",
      data: {
        savedJobs: validSavedJobs,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
      },
      error: null,
    });
  } catch (error) {
    console.log("failed to handle GetMySavedJobs", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve saved jobs",
      data: null,
      error: error.message,
    });
  }
};

export { SaveJob, UnsaveJob, GetMySavedJobs };
