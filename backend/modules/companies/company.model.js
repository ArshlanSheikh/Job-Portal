import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      trim: true,
      default: "Information Technology",
    },
    companySize: {
      type: String,
      trim: true,
      default: "11-50 employees",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    foundedYear: {
      type: Number,
      default: null,
    },
    socialLinks: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ companyName: "text", description: "text" });

const Company = mongoose.model("Company", companySchema);
export default Company;
