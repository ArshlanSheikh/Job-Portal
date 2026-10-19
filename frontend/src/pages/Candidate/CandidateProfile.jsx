import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Plus,
  Check,
  AlertCircle,
  ExternalLink,
  Camera,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { candidateService } from "../../services/api";
import styles from "./Candidate.module.css";

const resolveResumeUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};

const CandidateProfile = () => {
  const { user, updateUserState } = useAuth();


  // Basic info states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");

  // Skills
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  // Education
  const [education, setEducation] = useState([]);

  // Experience
  const [experience, setExperience] = useState([]);

  // Projects
  const [projects, setProjects] = useState([]);

  // Preferences
  const [preferredRoles, setPreferredRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [preferredLocations, setPreferredLocations] = useState([]);
  const [newLocation, setNewLocation] = useState("");
  const [expectedSalary, setExpectedSalary] = useState({
    currency: "USD",
    min: 0,
    max: 0,
    period: "yearly",
  });

  // Resume
  const [resume, setResume] = useState(null);

  // Status & Feedback
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Fetch candidate profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await candidateService.getMyProfile();
        if (res.data && res.data.success) {
          const d = res.data.data;
          setFullName(d.fullName || user?.name || "");
          setEmail(d.email || user?.email || "");
          setPhone(d.phone || user?.phone || "");
          setHeadline(d.headline || "");
          setCurrentLocation(d.currentLocation || "");
          setSummary(d.summary || "");
          setProfilePhoto(d.profilePhoto || user?.avatar || "");
          setSkills(d.skills || []);
          setEducation(d.education || []);
          setExperience(d.experience || []);
          setProjects(d.projects || []);
          setPreferredRoles(d.preferredRoles || []);
          setPreferredLocations(d.preferredLocations || []);
          if (d.expectedSalary) {
            setExpectedSalary({
              currency: d.expectedSalary.currency || "USD",
              min: d.expectedSalary.min || 0,
              max: d.expectedSalary.max || 0,
              period: d.expectedSalary.period || "yearly",
            });
          }
          setResume(d.resume || null);
          setCompletionPercentage(d.completionPercentage || 0);
        }
      } catch {
        setErrorMessage("Failed to load your candidate profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Handle Main Profile Save
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      setSaving(true);
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        headline: headline.trim(),
        currentLocation: currentLocation.trim(),
        summary: summary.trim(),
        profilePhoto,
        skills,
        education,
        experience,
        projects,
        preferredRoles,
        preferredLocations,
        expectedSalary,
      };

      const res = await candidateService.updateMyProfile(payload);
      if (res.data && res.data.success) {
        setSuccessMessage("Candidate profile updated successfully!");
        setCompletionPercentage(res.data.data.completionPercentage);
        if (user) {
          updateUserState({
            ...user,
            name: fullName.trim(),
            phone: phone.trim(),
            avatar: profilePhoto,
          });
        }
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to update profile. Please verify your inputs."
      );
    } finally {
      setSaving(false);
    }
  };

  // Add / Remove Skills
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Add / Remove Preferred Role
  const handleAddRole = (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    if (!preferredRoles.includes(newRole.trim())) {
      setPreferredRoles([...preferredRoles, newRole.trim()]);
    }
    setNewRole("");
  };

  const handleRemoveRole = (roleToRemove) => {
    setPreferredRoles(preferredRoles.filter((r) => r !== roleToRemove));
  };

  // Add / Remove Preferred Location
  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    if (!preferredLocations.includes(newLocation.trim())) {
      setPreferredLocations([...preferredLocations, newLocation.trim()]);
    }
    setNewLocation("");
  };

  const handleRemoveLocation = (locToRemove) => {
    setPreferredLocations(preferredLocations.filter((l) => l !== locToRemove));
  };

  // Add / Remove Education Item
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startYear: new Date().getFullYear() - 4,
        endYear: new Date().getFullYear(),
        grade: "",
      },
    ]);
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Add / Remove Experience Item
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        company: "",
        title: "",
        location: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
      },
    ]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Add / Remove Project Item
  const handleAddProject = () => {
    setProjects([
      ...projects,
      {
        title: "",
        description: "",
        technologies: [],
        liveUrl: "",
        githubUrl: "",
      },
    ]);
  };

  const handleUpdateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Resume File Upload
  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const allowedExts = [".pdf", ".doc", ".docx"];

    if (!allowedMimes.includes(file.type) && !allowedExts.includes(ext)) {
      setErrorMessage("Please select a PDF or Word document (.pdf, .doc, .docx)");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Resume file size must not exceed 10MB");
      e.target.value = "";
      return;
    }

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append("resume", file);

      const res = await candidateService.uploadResume(formData);
      if (res.data && res.data.success) {
        setResume(res.data.data.resume);
        setCompletionPercentage(res.data.data.completionPercentage);
        setSuccessMessage("Resume uploaded and indexed successfully!");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to upload resume file. Only PDF/DOC/DOCX under 10MB."
      );
    } finally {
      setUploadingResume(false);
      e.target.value = "";
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm("Are you sure you want to delete your stored resume? You will need to upload a new file when applying to jobs.")) {
      return;
    }
    try {
      setUploadingResume(true);
      const res = await candidateService.deleteResume();
      if (res.data && res.data.success) {
        setResume(null);
        setSuccessMessage("Resume removed successfully.");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch {
      setErrorMessage("Failed to remove resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  // Profile Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await candidateService.uploadPhoto(formData);
      if (res.data && res.data.success) {
        setProfilePhoto(res.data.data.profilePhoto);
        setCompletionPercentage(res.data.data.completionPercentage);
        if (user) {
          updateUserState({ ...user, avatar: res.data.data.profilePhoto });
        }
        setSuccessMessage("Profile photo uploaded!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to upload image file.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)" }}>Loading candidate profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* Top Header */}
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1 className={styles.pageTitle}>Candidate Profile Editor</h1>
            <span
              style={{
                padding: "0.25rem 0.75rem",
                backgroundColor: "var(--primary-50)",
                color: "var(--primary-700)",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              Strength: {completionPercentage}%
            </span>
          </div>
          <p className={styles.pageSubtitle}>
            Configure your professional information to attract premier recruiters and employers
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          className={styles.saveBtnFixed}
        >
          {saving ? (
            <span className="spinner" />
          ) : (
            <>
              <Check size={18} />
              <span>Save Profile Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            backgroundColor: "var(--success-50)",
            border: "1px solid #bbf7d0",
            color: "var(--success-700)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 500,
          }}
        >
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            backgroundColor: "var(--danger-50)",
            border: "1px solid #fecaca",
            color: "var(--danger-600)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontWeight: 500,
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Basic Information & Photo */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Basic Profile Details</h2>
            <p className={styles.cardSubtitle}>
              Your primary contact info, avatar, and headline
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          {/* Avatar upload */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "6rem",
                height: "6rem",
                borderRadius: "50%",
                backgroundColor: "var(--primary-100)",
                color: "var(--primary-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: 700,
                overflow: "hidden",
                border: "2px solid var(--border-light)",
                position: "relative",
              }}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                fullName.charAt(0).toUpperCase() || "U"
              )}
            </div>

            <label
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--primary-600)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Camera size={14} />
              <span>{uploadingPhoto ? "Uploading..." : "Change Photo"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
          </div>

          {/* Headline & Contact */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email Address</label>
                <input
                  type="email"
                  className={styles.formInput}
                  value={email}
                  disabled
                  style={{ backgroundColor: "var(--slate-100)", cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div className={styles.formGrid2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone Number</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Current Location</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={currentLocation}
                  onChange={(e) => setCurrentLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Professional Headline</label>
              <input
                type="text"
                className={styles.formInput}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer | React, Node.js & Cloud Architect"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Professional Summary</label>
          <textarea
            className={styles.formTextarea}
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Briefly highlight your career background, core competencies, accomplishments, and value proposition..."
          />
        </div>
      </div>

      {/* 2. Skills Portfolio */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Skills & Competencies</h2>
            <p className={styles.cardSubtitle}>
              Specific technologies and frameworks used for matching algorithms
            </p>
          </div>
        </div>

        <form onSubmit={handleAddSkill} style={{ display: "flex", gap: "0.5rem", maxWidth: "500px" }}>
          <input
            type="text"
            className={styles.formInput}
            placeholder="e.g. React.js, Docker, MongoDB..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button
            type="submit"
            style={{
              padding: "0.625rem 1.25rem",
              backgroundColor: "var(--primary-600)",
              color: "#ffffff",
              fontWeight: 600,
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} />
            <span>Add Skill</span>
          </button>
        </form>

        <div className={styles.tagList} style={{ marginTop: "1rem" }}>
          {skills.map((skill) => (
            <span key={skill} className={styles.tagItem}>
              <span>{skill}</span>
              <button
                type="button"
                className={styles.tagRemoveBtn}
                onClick={() => handleRemoveSkill(skill)}
                aria-label={`Remove skill ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
          {skills.length === 0 && (
            <p style={{ fontSize: "0.875rem", color: "var(--slate-400)" }}>
              No skills added yet. Type a skill and click "Add Skill".
            </p>
          )}
        </div>
      </div>

      {/* 3. Resume Upload */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Resume / Curriculum Vitae</h2>
            <p className={styles.cardSubtitle}>
              Upload your latest resume in PDF, DOC, or DOCX format (Max 10MB)
            </p>
          </div>
        </div>

        {resume && resume.fileUrl ? (
          <div className={styles.resumeActiveCard}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                  {resume.fileName || "Uploaded Resume"}
                </h4>
                <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
                  Uploaded on {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleDateString() : "Recently"}
                  {resume.fileSize ? ` • ${(resume.fileSize / 1024 / 1024).toFixed(2)} MB` : ""}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <a
                href={resolveResumeUrl(resume.fileUrl)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--primary-600)",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--primary-50)",
                }}
              >
                <span>View / Download</span>
                <ExternalLink size={14} />
              </a>

              <button
                type="button"
                onClick={handleDeleteResume}
                disabled={uploadingResume}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--danger-600)",
                  padding: "0.5rem 0.75rem",
                }}
              >
                <Trash2 size={16} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.resumeBox}>
            <Upload size={36} style={{ color: "var(--primary-500)", margin: "0 auto 1rem" }} />
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: "0.25rem" }}>
              Select a resume file to upload
            </h4>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", marginBottom: "1.25rem" }}>
              Supported file types: .pdf, .doc, .docx (Max 10MB)
            </p>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.5rem",
                backgroundColor: "var(--primary-600)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.875rem",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
              }}
            >
              <Upload size={16} />
              <span>{uploadingResume ? "Uploading..." : "Browse Resume File"}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={handleResumeFileUpload}
                disabled={uploadingResume}
              />
            </label>
          </div>
        )}
      </div>

      {/* 4. Work Experience */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Work Experience</h2>
            <p className={styles.cardSubtitle}>
              List past and current professional roles, accomplishments, and titles
            </p>
          </div>
          <button type="button" onClick={handleAddExperience} className={styles.addRowBtn}>
            <Plus size={16} />
            <span>Add Experience</span>
          </button>
        </div>

        {experience.map((exp, index) => (
          <div key={index} className={styles.dynamicItem}>
            <div className={styles.dynamicItemHeader}>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-800)" }}>
                Experience #{index + 1}: {exp.title || "Untitled Role"}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveExperience(index)}
                className={styles.removeRowBtn}
              >
                <Trash2 size={15} />
                <span>Remove</span>
              </button>
            </div>

            <div className={styles.formGrid2} style={{ marginBottom: "1rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Company Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={exp.company}
                  onChange={(e) => handleUpdateExperience(index, "company", e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Job Title</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={exp.title}
                  onChange={(e) => handleUpdateExperience(index, "title", e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
            </div>

            <div className={styles.formGrid3} style={{ marginBottom: "1rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={exp.location}
                  onChange={(e) => handleUpdateExperience(index, "location", e.target.value)}
                  placeholder="e.g. New York or Remote"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Start Date</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={exp.startDate}
                  onChange={(e) => handleUpdateExperience(index, "startDate", e.target.value)}
                  placeholder="e.g. Jan 2021"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>End Date</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={exp.endDate}
                  onChange={(e) => handleUpdateExperience(index, "endDate", e.target.value)}
                  placeholder="e.g. Present"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Key Responsibilities & Achievements</label>
              <textarea
                className={styles.formTextarea}
                rows={3}
                value={exp.description}
                onChange={(e) => handleUpdateExperience(index, "description", e.target.value)}
                placeholder="Describe your impact, tools utilized, and major achievements..."
              />
            </div>
          </div>
        ))}

        {experience.length === 0 && (
          <p style={{ fontSize: "0.875rem", color: "var(--slate-400)", textAlign: "center", padding: "1.5rem 0" }}>
            No work experience added yet. Click "Add Experience" to add your work history.
          </p>
        )}
      </div>

      {/* 5. Education */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Education & Degrees</h2>
            <p className={styles.cardSubtitle}>
              Degrees, academic institutions, and certifications
            </p>
          </div>
          <button type="button" onClick={handleAddEducation} className={styles.addRowBtn}>
            <Plus size={16} />
            <span>Add Education</span>
          </button>
        </div>

        {education.map((edu, index) => (
          <div key={index} className={styles.dynamicItem}>
            <div className={styles.dynamicItemHeader}>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-800)" }}>
                Degree #{index + 1}: {edu.degree || "Degree"}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveEducation(index)}
                className={styles.removeRowBtn}
              >
                <Trash2 size={15} />
                <span>Remove</span>
              </button>
            </div>

            <div className={styles.formGrid2} style={{ marginBottom: "1rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Institution / University</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={edu.institution}
                  onChange={(e) => handleUpdateEducation(index, "institution", e.target.value)}
                  placeholder="e.g. Stanford University"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Degree Type</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={edu.degree}
                  onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                />
              </div>
            </div>

            <div className={styles.formGrid3}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Field of Study</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={edu.fieldOfStudy}
                  onChange={(e) => handleUpdateEducation(index, "fieldOfStudy", e.target.value)}
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Graduation Year</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={edu.endYear || ""}
                  onChange={(e) => handleUpdateEducation(index, "endYear", Number(e.target.value))}
                  placeholder="2022"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>GPA / Grade</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={edu.grade}
                  onChange={(e) => handleUpdateEducation(index, "grade", e.target.value)}
                  placeholder="e.g. 3.8 / 4.0 or First Class"
                />
              </div>
            </div>
          </div>
        ))}

        {education.length === 0 && (
          <p style={{ fontSize: "0.875rem", color: "var(--slate-400)", textAlign: "center", padding: "1.5rem 0" }}>
            No education entries added yet. Click "Add Education" to list academic credentials.
          </p>
        )}
      </div>

      {/* 6. Projects */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Featured Projects</h2>
            <p className={styles.cardSubtitle}>
              Showcase tangible applications, open source repositories, and live links
            </p>
          </div>
          <button type="button" onClick={handleAddProject} className={styles.addRowBtn}>
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>

        {projects.map((proj, index) => (
          <div key={index} className={styles.dynamicItem}>
            <div className={styles.dynamicItemHeader}>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-800)" }}>
                Project #{index + 1}: {proj.title || "Untitled Project"}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveProject(index)}
                className={styles.removeRowBtn}
              >
                <Trash2 size={15} />
                <span>Remove</span>
              </button>
            </div>

            <div className={styles.formGrid2} style={{ marginBottom: "1rem" }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Title</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={proj.title}
                  onChange={(e) => handleUpdateProject(index, "title", e.target.value)}
                  placeholder="e.g. Real-Time Collaborative Workspace"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Live Deployment URL</label>
                <input
                  type="url"
                  className={styles.formInput}
                  value={proj.liveUrl}
                  onChange={(e) => handleUpdateProject(index, "liveUrl", e.target.value)}
                  placeholder="https://myproject.com"
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: "1rem" }}>
              <label className={styles.formLabel}>GitHub Repository URL</label>
              <input
                type="url"
                className={styles.formInput}
                value={proj.githubUrl}
                onChange={(e) => handleUpdateProject(index, "githubUrl", e.target.value)}
                placeholder="https://github.com/username/project"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Project Description</label>
              <textarea
                className={styles.formTextarea}
                rows={2}
                value={proj.description}
                onChange={(e) => handleUpdateProject(index, "description", e.target.value)}
                placeholder="Overview of the application, architecture decisions, and technologies used..."
              />
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <p style={{ fontSize: "0.875rem", color: "var(--slate-400)", textAlign: "center", padding: "1.5rem 0" }}>
            No projects added yet. Click "Add Project" to add your showcase builds.
          </p>
        )}
      </div>

      {/* 7. Preferences & Expectations */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Career Preferences & Expectations</h2>
            <p className={styles.cardSubtitle}>
              Desired roles, locations, and compensation parameters
            </p>
          </div>
        </div>

        {/* Preferred Job Roles */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label className={styles.formLabel}>Preferred Job Titles</label>
          <form onSubmit={handleAddRole} style={{ display: "flex", gap: "0.5rem", maxWidth: "500px", marginTop: "0.375rem" }}>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. Lead Frontend Engineer"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
            <button
              type="submit"
              style={{
                padding: "0.625rem 1rem",
                backgroundColor: "var(--slate-800)",
                color: "#ffffff",
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
              }}
            >
              Add
            </button>
          </form>
          <div className={styles.tagList} style={{ marginTop: "0.5rem" }}>
            {preferredRoles.map((r) => (
              <span key={r} className={styles.tagItem}>
                <span>{r}</span>
                <button
                  type="button"
                  className={styles.tagRemoveBtn}
                  onClick={() => handleRemoveRole(r)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Preferred Locations */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label className={styles.formLabel}>Preferred Locations</label>
          <form onSubmit={handleAddLocation} style={{ display: "flex", gap: "0.5rem", maxWidth: "500px", marginTop: "0.375rem" }}>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. Remote, San Francisco, New York"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <button
              type="submit"
              style={{
                padding: "0.625rem 1rem",
                backgroundColor: "var(--slate-800)",
                color: "#ffffff",
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
              }}
            >
              Add
            </button>
          </form>
          <div className={styles.tagList} style={{ marginTop: "0.5rem" }}>
            {preferredLocations.map((l) => (
              <span key={l} className={styles.tagItem}>
                <span>{l}</span>
                <button
                  type="button"
                  className={styles.tagRemoveBtn}
                  onClick={() => handleRemoveLocation(l)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Expected Salary */}
        <div className={styles.formGrid3}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Currency</label>
            <select
              className={styles.formSelect}
              value={expectedSalary.currency}
              onChange={(e) => setExpectedSalary({ ...expectedSalary, currency: e.target.value })}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Min Expected ({expectedSalary.currency})</label>
            <input
              type="number"
              className={styles.formInput}
              value={expectedSalary.min || ""}
              onChange={(e) => setExpectedSalary({ ...expectedSalary, min: Number(e.target.value) })}
              placeholder="100000"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Max Expected ({expectedSalary.currency})</label>
            <input
              type="number"
              className={styles.formInput}
              value={expectedSalary.max || ""}
              onChange={(e) => setExpectedSalary({ ...expectedSalary, max: Number(e.target.value) })}
              placeholder="140000"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: "2rem" }}>
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          className={styles.saveBtnFixed}
        >
          {saving ? (
            <span className="spinner" />
          ) : (
            <>
              <Check size={18} />
              <span>Save Profile Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CandidateProfile;
