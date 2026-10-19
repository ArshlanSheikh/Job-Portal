import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Users, Mail, Phone, Download } from "lucide-react";
import { applicationService, jobService } from "../../services/api";
import styles from "./ApplicationsReview.module.css";

const STATUS_OPTIONS = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Offered",
  "Hired",
  "Rejected",
];

const resolveResumeUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};


const ApplicationsReview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "all";

  const [companyJobs, setCompanyJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Load recruiter company jobs for selector
  useEffect(() => {
    jobService
      .getMyCompanyJobs({ limit: 100 })
      .then((res) => {
        if (res.data?.success && res.data.data?.jobs) {
          setCompanyJobs(res.data.data.jobs);
        }
      })
      .catch((err) => console.error("Failed to load jobs:", err));
  }, []);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      if (selectedJobId && selectedJobId !== "all") {
        const params = selectedStatus !== "all" ? { status: selectedStatus } : {};
        const res = await applicationService.getJobApplications(selectedJobId, params);
        if (res.data?.success) {
          setApplications(res.data.data.applications || []);
        }
      } else {
        const params = selectedStatus !== "all" ? { status: selectedStatus } : {};
        const res = await applicationService.getRecruiterAllApplications(params);
        if (res.data?.success) {
          setApplications(res.data.data.applications || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedJobId, selectedStatus]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleJobFilterChange = (jobId) => {
    setSelectedJobId(jobId);
    if (jobId === "all") {
      searchParams.delete("jobId");
    } else {
      searchParams.set("jobId", jobId);
    }
    setSearchParams(searchParams);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await applicationService.updateApplicationStatus(appId, {
        status: newStatus,
        note: `Status updated to ${newStatus} by recruiter`,
      });

      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Candidate Applications</h1>
          <p className={styles.subtitle}>
            Screen incoming candidate submissions, review resumes, and manage recruitment stages.
          </p>
        </div>
      </div>

      {/* Controls Bar: Filter by Job & Filter by Status */}
      <div className={styles.controlsBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filter by Job Opening</label>
          <select
            className={styles.selectInput}
            value={selectedJobId}
            onChange={(e) => handleJobFilterChange(e.target.value)}
          >
            <option value="all">All Company Openings</option>
            {companyJobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.applicantCount || 0} applicants)
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Filter by Status</label>
          <select
            className={styles.selectInput}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className={styles.emptyState}>
          <p>Loading candidate applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={40} color="#94a3b8" style={{ marginBottom: "1rem" }} />
          <h2 className={styles.emptyTitle}>No applications found</h2>
          <p className={styles.emptyText}>
            There are no candidates matching your current filter selections.
          </p>
        </div>
      ) : (
        <div className={styles.applicationsGrid}>
          {applications.map((app) => {
            const candidate = app.candidateId;
            const profile = app.candidateProfile;
            const job = app.jobId;

            return (
              <article key={app._id} className={styles.appCard}>
                <div className={styles.appHeader}>
                  <div className={styles.candidateSummary}>
                    {candidate?.avatar ? (
                      <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {candidate?.name ? candidate.name.charAt(0).toUpperCase() : "C"}
                      </div>
                    )}

                    <div>
                      <h2 className={styles.candidateName}>
                        {candidate?.name || "Candidate"}
                      </h2>
                      {profile?.headline && (
                        <div className={styles.candidateHeadline}>{profile.headline}</div>
                      )}

                      <div className={styles.candidateContact}>
                        {candidate?.email && (
                          <span className={styles.contactItem}>
                            <Mail size={14} />
                            <span>{candidate.email}</span>
                          </span>
                        )}
                        {candidate?.phone && (
                          <span className={styles.contactItem}>
                            <Phone size={14} />
                            <span>{candidate.phone}</span>
                          </span>
                        )}
                        <span>
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className={styles.statusChangeBox}>
                    <label
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      Stage / Status
                    </label>
                    <select
                      className={styles.statusSelect}
                      value={app.status}
                      disabled={updatingId === app._id}
                      onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Job Target */}
                {job && (
                  <div className={styles.jobTargetRow}>
                    <div>
                      Applied for:{" "}
                      <Link to={`/jobs/${job._id}`} className={styles.jobTargetTitle}>
                        {job.title}
                      </Link>
                    </div>
                    <div>
                      {job.workplaceType ? job.workplaceType.toUpperCase() : "ONSITE"} •{" "}
                      {job.employmentType}
                    </div>
                  </div>
                )}

                {/* Skills tags from candidate profile */}
                {profile?.skills && profile.skills.length > 0 && (
                  <div className={styles.skillsRow}>
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className={styles.skillPill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cover Letter */}
                {app.coverLetter && (
                  <div className={styles.coverLetterBox}>
                    <div className={styles.coverLetterTitle}>Cover Letter</div>
                    <div>{app.coverLetter}</div>
                  </div>
                )}

                {/* Footer: Resume Download */}
                <div className={styles.appFooter}>
                  <div>
                    {app.resume?.fileName ? (
                      <span>File: {app.resume.fileName}</span>
                    ) : (
                      <span>Resume attached</span>
                    )}
                  </div>

                  {app.resume?.fileUrl && (
                    <a
                      href={resolveResumeUrl(app.resume.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.resumeDownloadBtn}
                    >
                      <Download size={15} />
                      <span>View / Download Resume</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationsReview;
