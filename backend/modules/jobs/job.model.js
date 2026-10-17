import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company reference is required"],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator reference is required"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    qualifications: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    experienceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10 },
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "temporary"],
      default: "full-time",
      index: true,
    },
    workplaceType: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      default: "hybrid",
      index: true,
    },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
      period: { type: String, default: "yearly" }, // yearly, monthly, hourly
    },
    location: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    vacancies: {
      type: Number,
      default: 1,
    },
    deadline: {
      type: Date,
      default: null,
    },
    requiredEducation: {
      type: String,
      trim: true,
      default: "Bachelor's Degree or Equivalent",
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
      index: true,
    },
    applicantCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({
  title: "text",
  description: "text",
  skills: "text",
  location: "text",
});

const Job = mongoose.model("Job", jobSchema);
export default Job;
