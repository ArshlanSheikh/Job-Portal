import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Users,
  GraduationCap,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Upload,
  X,
  FileText,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  jobService,
  savedJobService,
  applicationService,
  candidateService,
} from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import styles from "./JobDetails.module.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application Status state
  const [hasApplied, setHasApplied] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState("");

  // Apply Form State
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [uploadedResumeFile, setUploadedResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");

  // Load Job Details
  const loadJob = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobService.getJobById(id);
      if (res.data?.success) {
        setJob(res.data.data.job);
        setIsSaved(Boolean(res.data.data.isSaved));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  // Check candidate profile and whether they already applied
  useEffect(() => {
    if (isAuthenticated && user?.role === "candidate") {
      candidateService
        .getMyProfile()
        .then((res) => {
          if (res.data?.success && res.data.data) {
            setCandidateProfile(res.data.data);
            if (!res.data.data.resume?.fileUrl) {
              setUseProfileResume(false);
            }
          }
        })
        .catch(() => {});

      applicationService
        .getMyApplications({ limit: 100 })
        .then((res) => {
          if (res.data?.success && res.data.data?.applications) {
            const applied = res.data.data.applications.some(
              (app) => app.jobId?._id === id || app.jobId === id
            );
            setHasApplied(applied);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user, id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role !== "candidate") {
      alert("Only candidates can save jobs.");
      return;
    }

    try {
      if (isSaved) {
        await savedJobService.unsaveJob(id);
        setIsSaved(false);
      } else {
        await savedJobService.saveJob(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role !== "candidate") {
      alert("Only candidates can apply to job openings.");
      return;
    }
    setApplyError("");
    setApplyModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowed.includes(file.type)) {
        setApplyError("Please upload a PDF or Word document (.pdf, .doc, .docx)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setApplyError("Resume file size must not exceed 5MB");
        return;
      }
      setApplyError("");
      setUploadedResumeFile(file);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError("");

    if (!useProfileResume && !uploadedResumeFile) {
      setApplyError("Please select a resume file to submit with your application.");
      return;
    }

    if (useProfileResume && !candidateProfile?.resume?.fileUrl) {
      setApplyError("Your profile does not have a saved resume yet. Please upload a file.");
      return;
    }

    try {
      setSubmitting(true);

      if (uploadedResumeFile) {
        const formData = new FormData();
        formData.append("jobId", id);
        formData.append("coverLetter", coverLetter);
        formData.append("resume", uploadedResumeFile);
        formData.append("useProfileResume", "false");
        await applicationService.applyToJob(formData);
      } else {
        await applicationService.applyToJob({
          jobId: id,
          coverLetter,
          useProfileResume: true,
        });
      }

      setHasApplied(true);
      setApplyModalOpen(false);
      alert("Application submitted successfully! You can track its status in your dashboard.");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit application. Please try again.";
      setApplyError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange || (!salaryRange.min && !salaryRange.max)) return "Not specified";
    const { min, max, currency = "USD", period = "yearly" } = salaryRange;
    const symbol = currency === "USD" ? "$" : currency;
    const periodLabel = period === "yearly" ? "/yr" : "/mo";

    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()} ${periodLabel}`;
    }
    if (min) return `From ${symbol}${min.toLocaleString()} ${periodLabel}`;
    return `Up to ${symbol}${max.toLocaleString()} ${periodLabel}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading opening details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={styles.container}>
        <div className={styles.alertError}>
          <h3>Could not find job opening</h3>
          <p>{error || "The job opening you are looking for does not exist or has been removed."}</p>
          <Link to="/jobs" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to all jobs</span>
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = job.status === "closed";

  return (
    <div className={styles.container}>
      <Link to="/jobs" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to job listings</span>
      </Link>

      {/* Header Banner */}
      <div className={styles.headerCard}>
        <div className={styles.headerTop}>
          <div className={styles.companySection}>
            <div className={styles.companyLogoWrapper}>
              {job.company?.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.companyName}
                  className={styles.companyLogo}
                />
              ) : (
                <Building size={32} color="#94a3b8" />
              )}
            </div>
            <div>
              <h1 className={styles.jobTitle}>{job.title}</h1>
              <div className={styles.companyName}>
                {job.company?.companyName || "Organization"}
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            {user?.role === "candidate" && (
              <button
                type="button"
                className={`${styles.saveIconBtn} ${
                  isSaved ? styles.saveIconBtnActive : ""
                }`}
                onClick={handleToggleSave}
                title={isSaved ? "Saved" : "Save Opening"}
              >
                <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
              </button>
            )}

            {hasApplied ? (
              <div className={styles.appliedBadge}>
                <CheckCircle2 size={18} />
                <span>Application Submitted</span>
              </div>
            ) : isClosed ? (
              <button disabled className={styles.applyPrimaryBtn}>
                Position Closed
              </button>
            ) : (
              <button
                type="button"
                className={styles.applyPrimaryBtn}
                onClick={handleApplyClick}
              >
                <span>Apply for Position</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Metrics */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper}>
              <MapPin size={20} />
            </div>
            <div>
              <div className={styles.metricLabel}>Location</div>
              <div className={styles.metricValue}>
                {job.location || "Remote / Unspecified"}
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper}>
              <Sparkles size={20} />
            </div>
            <div>
              <div className={styles.metricLabel}>Workplace</div>
              <div className={styles.metricValue}>
                {job.workplaceType ? job.workplaceType.toUpperCase() : "ONSITE"}
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper}>
              <Briefcase size={20} />
            </div>
            <div>
              <div className={styles.metricLabel}>Employment Type</div>
              <div className={styles.metricValue}>{job.employmentType}</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper}>
              <DollarSign size={20} />
            </div>
            <div>
              <div className={styles.metricLabel}>Compensation</div>
              <div className={styles.metricValue}>{formatSalary(job.salaryRange)}</div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper}>
              <Calendar size={20} />
            </div>
            <div>
              <div className={styles.metricLabel}>Application Deadline</div>
              <div className={styles.metricValue}>
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString()
                  : "Rolling Admissions"}
              </div>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIconWrapper}>
              <Users size={20} />
            </div>
            <div>
              <div className={styles.metricLabel}>Openings</div>
              <div className={styles.metricValue}>{job.vacancies || 1} Vacancy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.contentGrid}>
        <div className={styles.mainBody}>
          {/* Job Description */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>About the Role</h2>
            <div className={styles.sectionBody}>{job.description}</div>
          </section>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Key Responsibilities</h2>
              <ul className={styles.bulletList}>
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <span className={styles.bulletDot} />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Qualifications & Experience</h2>
              <ul className={styles.bulletList}>
                {job.qualifications.map((qual, i) => (
                  <li key={i} className={styles.bulletItem}>
                    <span className={styles.bulletDot} />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Required Skills */}
          {job.skills && job.skills.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Skills & Competencies</h2>
              <div className={styles.skillsContainer}>
                {job.skills.map((skill, index) => (
                  <span key={index} className={styles.skillBadge}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Info Card */}
        <aside className={styles.sidebarCard}>
          <h3 className={styles.sidebarTitle}>About the Employer</h3>

          <div className={styles.companyMetaList}>
            {job.company?.industry && (
              <div className={styles.companyMetaItem}>
                <Building size={16} />
                <span>{job.company.industry}</span>
              </div>
            )}
            {job.company?.location && (
              <div className={styles.companyMetaItem}>
                <MapPin size={16} />
                <span>{job.company.location}</span>
              </div>
            )}
            {job.company?.website && (
              <div className={styles.companyMetaItem}>
                <ExternalLink size={16} />
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.websiteLink}
                >
                  Visit Website
                </a>
              </div>
            )}
            {job.requiredEducation && (
              <div className={styles.companyMetaItem}>
                <GraduationCap size={16} />
                <span>{job.requiredEducation}</span>
              </div>
            )}
            <div className={styles.companyMetaItem}>
              <Clock size={16} />
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {job.company?.description && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
                marginTop: "0.5rem",
              }}
            >
              {job.company.description}
            </p>
          )}
        </aside>
      </div>

      {/* Interactive Apply Modal */}
      {applyModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setApplyModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Apply to {job.title}</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setApplyModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit}>
              <div className={styles.modalBody}>
                {applyError && (
                  <div className={styles.alertError}>
                    <AlertCircle size={18} />
                    <span>{applyError}</span>
                  </div>
                )}

                {/* Resume Selection */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Resume Selection *</label>
                  <div className={styles.radioChoiceGroup}>
                    {candidateProfile?.resume?.fileName && (
                      <label
                        className={`${styles.radioCard} ${
                          useProfileResume ? styles.radioCardActive : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="resumeSource"
                          checked={useProfileResume}
                          onChange={() => setUseProfileResume(true)}
                        />
                        <div>
                          <strong>Use Profile Resume</strong>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-secondary)",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              marginTop: "0.25rem",
                            }}
                          >
                            <FileText size={14} />
                            <span>{candidateProfile.resume.fileName}</span>
                          </div>
                        </div>
                      </label>
                    )}

                    <label
                      className={`${styles.radioCard} ${
                        !useProfileResume ? styles.radioCardActive : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="resumeSource"
                        checked={!useProfileResume}
                        onChange={() => setUseProfileResume(false)}
                      />
                      <div>
                        <strong>Upload New Resume File</strong>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.25rem",
                          }}
                        >
                          Upload PDF, DOC, or DOCX (Max 5MB)
                        </div>
                      </div>
                    </label>
                  </div>

                  {!useProfileResume && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        id="resumeUploadInput"
                      />
                      <label htmlFor="resumeUploadInput" className={styles.fileDropzone}>
                        <Upload size={24} style={{ color: "var(--primary-color)", margin: "0 auto 0.5rem" }} />
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {uploadedResumeFile
                            ? uploadedResumeFile.name
                            : "Click to browse and upload resume"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          PDF, DOC, DOCX up to 5MB
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Optional Cover Letter */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Cover Letter / Personal Note (Optional)
                  </label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Introduce yourself and explain why your experience makes you an ideal fit for this requisition..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setApplyModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
