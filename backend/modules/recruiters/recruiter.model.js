import mongoose from "mongoose";

const recruiterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "Technical Recruiter",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    companyName: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "Talent Acquisition",
    },
    professionalBio: {
      type: String,
      trim: true,
      default: "",
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Recruiter = mongoose.model("Recruiter", recruiterSchema);
export default Recruiter;
