import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Users,
  Briefcase,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { companyService } from "../../services/api";
import styles from "./Employer.module.css";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await companyService.getDashboardData();
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load employer dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRevokeRecruiter = async (recruiterId, recruiterName) => {
    if (
      !window.confirm(
        `Are you sure you want to revoke recruiter authorization for ${recruiterName || "this recruiter"}? They will no longer be able to manage this company's jobs.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await companyService.removeCompanyRecruiter(recruiterId);
      setFeedbackMessage({
        type: "success",
        text: `Recruiter authorization for ${recruiterName || "recruiter"} was revoked successfully.`,
      });
      fetchDashboard();
    } catch (err) {
      setFeedbackMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to remove recruiter authorization.",
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)", fontWeight: 500 }}>
          Loading your enterprise workspace...
        </p>
      </div>
    );
  }

  const company = dashboardData?.company || {};
  const stats = dashboardData?.stats || {};
  const recruiters = dashboardData?.recruiters || [];
  const recentJobs = dashboardData?.recentJobs || [];
  const recentApplications = dashboardData?.recentApplications || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "Shortlisted":
        return { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" };
      case "Interview":
        return { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" };
      case "Offered":
      case "Hired":
        return { bg: "#f0fdf4", color: "#16a34a", border: "#86efac" };
      case "Rejected":
        return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
      case "Under Review":
        return { bg: "#fefce8", color: "#ca8a04", border: "#fef08a" };
      default:
        return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
    }
  };

  return (
    <div className={styles.employerContainer}>
      {/* Feedback Message */}
      {feedbackMessage && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: feedbackMessage.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: feedbackMessage.type === "success" ? "#065f46" : "#991b1b",
            border: `1px solid ${feedbackMessage.type === "success" ? "#a7f3d0" : "#fecaca"}`,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.9375rem",
            fontWeight: 500,
          }}
        >
          {feedbackMessage.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Employer Command Center</h1>
          <p className={styles.subtitle}>
            Welcome back, {user?.name || "Employer"}. Oversee your organization profile, hiring pipeline, and authorized recruiting team.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/jobs/create" className={styles.saveBtn}>
            <PlusCircle size={16} />
            <span>Publish Opening</span>
          </Link>
          <Link to="/profile/employer" className={styles.saveBtn} style={{ backgroundColor: "#ffffff", color: "var(--slate-800)", border: "1px solid var(--border-light)" }}>
            <Building size={16} />
            <span>Company Branding</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className={styles.statsGrid}>
        <Link to="/dashboard/employer/jobs" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.activeJobs || 0}</div>
            <div className={styles.statLabel}>Active Openings ({stats.totalJobs || 0} total)</div>
          </div>
        </Link>

        <Link to="/dashboard/employer/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            <Users size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.totalApplications || 0}</div>
            <div className={styles.statLabel}>Total Candidate Submissions</div>
          </div>
        </Link>

        <Link to="/dashboard/employer/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {(stats.shortlistedCount || 0) + (stats.hiredCount || 0)}
            </div>
            <div className={styles.statLabel}>Shortlisted & Hired</div>
          </div>
        </Link>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.affiliatedRecruitersCount || 0}</div>
            <div className={styles.statLabel}>Authorized Recruiters</div>
          </div>
        </div>
      </div>

      {/* Company Brand Card */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Organization Brand Profile</h2>
            <p className={styles.cardSubtitle}>
              Live company identity and employer branding visible across the talent portal
            </p>
          </div>
          <Link
            to="/profile/employer"
            style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
          >
            Edit Branding
          </Link>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <div
            style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--slate-100)",
              border: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--primary-700)",
              overflow: "hidden",
            }}
          >
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.companyName}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              company.companyName?.charAt(0).toUpperCase() || "C"
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                {company.companyName || "Organization Profile"}
              </h3>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.6rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-700)",
                }}
              >
                {company.industry || "Information Technology"}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.25rem",
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--slate-600)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Users size={16} style={{ color: "var(--slate-400)" }} />
                <span>{company.companySize || "11-50 employees"}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <MapPin size={16} style={{ color: "var(--slate-400)" }} />
                <span>{company.location || "Headquarters not set"}</span>
              </span>
              {company.website && (
                <a
                  href={
                    company.website.startsWith("http")
                      ? company.website
                      : `https://${company.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    color: "var(--primary-600)",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <Globe size={16} />
                  <span>{company.website}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {company.description && (
              <p style={{ marginTop: "0.75rem", fontSize: "0.9375rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                {company.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recruitment Pipeline Funnel */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Company Hiring Pipeline</h2>
            <p className={styles.cardSubtitle}>
              Distribution of all candidate applications across hiring stages
            </p>
          </div>
          <Link
            to="/dashboard/employer/applications"
            style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
          >
            Review All Submissions
          </Link>
        </div>

        <div className={styles.pipelineGrid}>
          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#ca8a04" }}>
              {stats.appliedCount || 0}
            </div>
            <div className={styles.pipelineLabel}>Applied</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#d97706" }}>
              {stats.underReviewCount || 0}
            </div>
            <div className={styles.pipelineLabel}>Under Review</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#059669" }}>
              {stats.shortlistedCount || 0}
            </div>
            <div className={styles.pipelineLabel}>Shortlisted</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#2563eb" }}>
              {stats.interviewCount || 0}
            </div>
            <div className={styles.pipelineLabel}>Interviewing</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#7c3aed" }}>
              {stats.offeredCount || 0}
            </div>
            <div className={styles.pipelineLabel}>Offered</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#16a34a" }}>
              {stats.hiredCount || 0}
            </div>
            <div className={styles.pipelineLabel}>Hired</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#dc2626" }}>
              {stats.rejectedCount || 0}
            </div>
            <div className={styles.pipelineLabel}>Rejected</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#64748b" }}>
              {stats.withdrawnCount || 0}
            </div>
            <div className={styles.pipelineLabel}>Withdrawn</div>
          </div>
        </div>
      </div>

      {/* 2-Column Content */}
      <div className={styles.dashboardGrid}>
        {/* Left Column: Job Listings & Applications Stream */}
        <div className={styles.dashboardColumn}>
          {/* Company Job Listings */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Company Job Listings</h2>
                <p className={styles.cardSubtitle}>
                  Current requisitions published under your organization
                </p>
              </div>
              <Link
                to="/dashboard/employer/jobs"
                style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
              >
                Manage All ({stats.totalJobs || 0})
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--slate-500)" }}>
                <Briefcase size={36} color="#94a3b8" style={{ marginBottom: "0.75rem" }} />
                <h3 style={{ fontSize: "1.0625rem", color: "var(--slate-800)", fontWeight: 600 }}>No job openings posted</h3>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  Start attracting top talent by creating your first company requisition.
                </p>
                <Link to="/jobs/create" className={styles.saveBtn} style={{ marginTop: "1rem" }}>
                  <span>Publish First Job</span>
                </Link>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.miniTable}>
                  <thead>
                    <tr>
                      <th>Opening Title</th>
                      <th>Workplace</th>
                      <th>Status</th>
                      <th>Applicants</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr key={job._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--slate-900)" }}>{job.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--slate-500)" }}>{job.location || "Remote"}</div>
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{job.workplaceType}</td>
                        <td>
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              backgroundColor: job.status === "published" ? "#ecfdf5" : "#f1f5f9",
                              color: job.status === "published" ? "#059669" : "#64748b",
                            }}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{job.applicantCount || 0}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Link
                              to={`/jobs/edit/${job._id}`}
                              style={{ color: "var(--primary-600)", fontWeight: 600, textDecoration: "none", fontSize: "0.8125rem" }}
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/jobs/${job._id}`}
                              style={{ color: "var(--slate-500)", textDecoration: "none", fontSize: "0.8125rem" }}
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Candidate Applications */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Recent Submissions</h2>
                <p className={styles.cardSubtitle}>
                  Latest candidate applications submitted to company postings
                </p>
              </div>
              <Link
                to="/dashboard/employer/applications"
                style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
              >
                Review All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--slate-400)", fontSize: "0.875rem" }}>
                No candidate submissions yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentApplications.map((app) => {
                  const candidate = app.candidateId;
                  const job = app.jobId;
                  const stStyle = getStatusColor(app.status);

                  return (
                    <div key={app._id} className={styles.recruiterCard}>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--slate-900)", fontSize: "0.9375rem" }}>
                          {candidate?.name || "Applicant"}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
                          Applied for {job?.title || "Position"} • {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.65rem",
                            borderRadius: "var(--radius-full)",
                            backgroundColor: stStyle.bg,
                            color: stStyle.color,
                            border: `1px solid ${stStyle.border}`,
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                          }}
                        >
                          {app.status}
                        </span>

                        <Link
                          to={`/dashboard/employer/applications?jobId=${job?._id || "all"}`}
                          style={{
                            padding: "0.35rem 0.75rem",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "#ffffff",
                            border: "1px solid var(--border-light)",
                            color: "var(--primary-600)",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            textDecoration: "none",
                          }}
                        >
                          Screen
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Authorized Recruiters & Operations */}
        <div className={styles.dashboardColumn}>
          {/* Authorized Recruiter Management */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Authorized Recruiters</h2>
                <p className={styles.cardSubtitle}>
                  Team members authorized to recruit on behalf of {company.companyName}
                </p>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.5rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--primary-50)",
                  color: "var(--primary-700)",
                }}
              >
                {recruiters.length} Active
              </span>
            </div>

            {recruiters.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "var(--slate-400)", fontSize: "0.875rem" }}>
                No recruiters currently linked. Recruiters can link to your company by choosing your company name in their profile.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recruiters.map((rec) => (
                  <div key={rec._id} className={styles.recruiterCard}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div className={styles.recruiterAvatar}>
                        {rec.fullName ? rec.fullName.charAt(0).toUpperCase() : "R"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--slate-900)", fontSize: "0.9375rem" }}>
                          {rec.fullName || "Recruiter"}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
                          {rec.jobTitle || "Recruiter"} • {rec.department || "Talent Team"}
                        </div>
                        {rec.userId?.email && (
                          <div style={{ fontSize: "0.75rem", color: "var(--slate-400)" }}>
                            {rec.userId.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleRevokeRecruiter(rec._id, rec.fullName)}
                      title="Revoke company recruiting authorization"
                      style={{
                        padding: "0.35rem 0.65rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #fecaca",
                        backgroundColor: "#fff5f5",
                        color: "#dc2626",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enterprise Hiring Operations */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle} style={{ marginBottom: "1rem" }}>
              Enterprise Operations
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link
                to="/jobs/create"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--border-light)",
                  textDecoration: "none",
                  color: "var(--slate-800)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                <PlusCircle size={18} style={{ color: "var(--primary-600)" }} />
                <span>Publish New Company Job</span>
              </Link>

              <Link
                to="/dashboard/employer/jobs"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--border-light)",
                  textDecoration: "none",
                  color: "var(--slate-800)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                <Briefcase size={18} style={{ color: "var(--primary-600)" }} />
                <span>Manage Organization Openings</span>
              </Link>

              <Link
                to="/dashboard/employer/applications"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--border-light)",
                  textDecoration: "none",
                  color: "var(--slate-800)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                <Users size={18} style={{ color: "var(--primary-600)" }} />
                <span>Review Candidate Submissions</span>
              </Link>

              <Link
                to="/candidates"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--border-light)",
                  textDecoration: "none",
                  color: "var(--slate-800)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                <Search size={18} style={{ color: "var(--primary-600)" }} />
                <span>Discover Verified Talent</span>
              </Link>

              <Link
                to="/profile/employer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-50)",
                  border: "1px solid var(--border-light)",
                  textDecoration: "none",
                  color: "var(--slate-800)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                <Building size={18} style={{ color: "var(--primary-600)" }} />
                <span>Update Company Profile & Logo</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
