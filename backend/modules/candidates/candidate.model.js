import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true, default: "" },
  degree: { type: String, trim: true, default: "" },
  fieldOfStudy: { type: String, trim: true, default: "" },
  startYear: { type: Number, default: null },
  endYear: { type: Number, default: null },
  grade: { type: String, trim: true, default: "" },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, trim: true, default: "" },
  title: { type: String, trim: true, default: "" },
  location: { type: String, trim: true, default: "" },
  startDate: { type: String, trim: true, default: "" },
  endDate: { type: String, trim: true, default: "" },
  currentlyWorking: { type: Boolean, default: false },
  description: { type: String, trim: true, default: "" },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },
  technologies: [{ type: String, trim: true }],
  liveUrl: { type: String, trim: true, default: "" },
  githubUrl: { type: String, trim: true, default: "" },
});

const candidateSchema = new mongoose.Schema(
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    currentLocation: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    resume: {
      fileName: { type: String, default: "" },
      fileUrl: { type: String, default: "" },
      fileSize: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: null },
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    preferredRoles: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredLocations: [
      {
        type: String,
        trim: true,
      },
    ],
    expectedSalary: {
      currency: { type: String, default: "USD" },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      period: { type: String, default: "yearly" },
    },
    completionPercentage: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to compute completion percentage
candidateSchema.methods.calculateCompletion = function () {
  let score = 0;
  if (this.fullName) score += 10;
  if (this.headline) score += 15;
  if (this.summary) score += 15;
  if (this.currentLocation) score += 10;
  if (this.skills && this.skills.length > 0) score += 15;
  if (this.experience && this.experience.length > 0) score += 15;
  if (this.education && this.education.length > 0) score += 10;
  if (this.resume && this.resume.fileUrl) score += 10;
  this.completionPercentage = Math.min(100, score);
  return this.completionPercentage;
};

candidateSchema.index({ skills: 1 });
candidateSchema.index({ preferredRoles: 1 });

const Candidate = mongoose.model("Candidate", candidateSchema);
export default Candidate;
