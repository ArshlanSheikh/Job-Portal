import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UserCheck,
  Users,
  Briefcase,
  Search,
  PlusCircle,
  Clock,
  ArrowRight,
  Send,
} from "lucide-react";
import { recruiterService } from "../../services/api";
import styles from "./Recruiter.module.css";

const RecruiterDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await recruiterService.getDashboardData();
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load recruiter dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)", fontWeight: 500 }}>
          Loading your recruitment workspace...
        </p>
      </div>
    );
  }

  const profile = dashboardData?.profile || {};
  const stats = dashboardData?.stats || {};
  const recentApplications = dashboardData?.recentApplications || [];
  const recentJobs = dashboardData?.recentJobs || [];
  const recentInvitations = dashboardData?.recentInvitations || [];

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
    <div className={styles.recruiterContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Recruiter Command Hub</h1>
          <p className={styles.subtitle}>
            Welcome back, {profile.fullName || "Recruiter"}. Manage active requisitions, review candidates, and send invitations.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/jobs/create" className={styles.saveBtn}>
            <PlusCircle size={16} />
            <span>Post Opening</span>
          </Link>
          <Link to="/candidates" className={styles.saveBtn} style={{ backgroundColor: "#ffffff", color: "var(--slate-800)", border: "1px solid var(--border-light)" }}>
            <Search size={16} />
            <span>Discover Talent</span>
          </Link>
          <Link to="/profile/recruiter" className={styles.saveBtn} style={{ backgroundColor: "#ffffff", color: "var(--slate-800)", border: "1px solid var(--border-light)" }}>
            <UserCheck size={16} />
            <span>My Profile</span>
          </Link>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className={styles.statsGrid}>
        <Link to="/dashboard/recruiter/jobs" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.activeJobs || 0}</div>
            <div className={styles.statLabel}>Active Requisitions</div>
          </div>
        </Link>

        <Link to="/dashboard/recruiter/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            <Users size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.totalApplications || 0}</div>
            <div className={styles.statLabel}>Total Applicants</div>
          </div>
        </Link>

        <Link to="/dashboard/recruiter/applications?status=Applied" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#fefce8", color: "#ca8a04" }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.awaitingReviewApplications || 0}</div>
            <div className={styles.statLabel}>Awaiting Initial Review</div>
          </div>
        </Link>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            <Send size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{stats.totalInvitations || 0}</div>
            <div className={styles.statLabel}>Invitations Sent ({stats.acceptedInvitations || 0} accepted)</div>
          </div>
        </div>
      </div>

      {/* Candidate Pipeline Overview */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Recruitment Pipeline Stages</h2>
            <p className={styles.cardSubtitle}>
              Live candidate count across each hiring stage for your company openings
            </p>
          </div>
          <Link
            to="/dashboard/recruiter/applications"
            style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
          >
            View Applications Board
          </Link>
        </div>

        <div className={styles.pipelineGrid}>
          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#ca8a04" }}>
              {stats.awaitingReviewApplications || 0}
            </div>
            <div className={styles.pipelineLabel}>Applied (New)</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#d97706" }}>
              {stats.underReviewApplications || 0}
            </div>
            <div className={styles.pipelineLabel}>Under Review</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#059669" }}>
              {stats.shortlistedApplications || 0}
            </div>
            <div className={styles.pipelineLabel}>Shortlisted</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#2563eb" }}>
              {stats.interviewApplications || 0}
            </div>
            <div className={styles.pipelineLabel}>Interviewing</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#7c3aed" }}>
              {stats.offeredApplications || 0}
            </div>
            <div className={styles.pipelineLabel}>Offers Extended</div>
          </div>

          <div className={styles.pipelineCard}>
            <div className={styles.pipelineCount} style={{ color: "#16a34a" }}>
              {stats.hiredApplications || 0}
            </div>
            <div className={styles.pipelineLabel}>Hired</div>
          </div>
        </div>
      </div>

      {/* 2-Column Main Dashboard Content */}
      <div className={styles.dashboardGrid}>
        {/* Left Column */}
        <div className={styles.dashboardColumn}>
          {/* Recent Candidate Applications */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Recent Applicants</h2>
                <p className={styles.cardSubtitle}>
                  Latest candidate submissions requiring screening or stage advancement
                </p>
              </div>
              <Link
                to="/dashboard/recruiter/applications"
                style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
              >
                Screen All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--slate-500)" }}>
                <Users size={36} color="#94a3b8" style={{ marginBottom: "0.75rem" }} />
                <h3 style={{ fontSize: "1.0625rem", color: "var(--slate-800)", fontWeight: 600 }}>No applicants yet</h3>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  When candidates apply to your job requisitions, they will appear here immediately.
                </p>
                <Link to="/jobs/create" className={styles.saveBtn} style={{ marginTop: "1rem" }}>
                  <span>Post a Requisition</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentApplications.map((app) => {
                  const candidate = app.candidateId;
                  const profile = app.candidateProfile;
                  const job = app.jobId;
                  const stStyle = getStatusColor(app.status);

                  return (
                    <div key={app._id} className={styles.appItemCard}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {candidate?.avatar ? (
                          <img
                            src={candidate.avatar}
                            alt={candidate.name}
                            style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "2.5rem",
                              height: "2.5rem",
                              borderRadius: "50%",
                              backgroundColor: "var(--primary-50)",
                              color: "var(--primary-700)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.9375rem",
                            }}
                          >
                            {candidate?.name ? candidate.name.charAt(0).toUpperCase() : "C"}
                          </div>
                        )}

                        <div>
                          <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                            {candidate?.name || "Applicant"}
                          </div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
                            {job?.title || "Position"}{profile?.headline ? ` • ${profile.headline}` : ""} • Applied on {new Date(app.createdAt).toLocaleDateString()}
                          </div>
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
                          to={`/dashboard/recruiter/applications?jobId=${job?._id || "all"}`}
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
                          Review
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Job Requisitions */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Managed Job Requisitions</h2>
                <p className={styles.cardSubtitle}>
                  Status and applicant counts for your company postings
                </p>
              </div>
              <Link
                to="/dashboard/recruiter/jobs"
                style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
              >
                Manage All ({stats.totalJobs || 0})
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--slate-500)" }}>
                <p style={{ fontSize: "0.875rem" }}>No job requisitions created yet.</p>
                <Link to="/jobs/create" className={styles.saveBtn} style={{ marginTop: "0.75rem" }}>
                  <span>Create First Requisition</span>
                </Link>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.miniTable}>
                  <thead>
                    <tr>
                      <th>Title</th>
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
        </div>

        {/* Right Column */}
        <div className={styles.dashboardColumn}>
          {/* Quick Recruitment Actions */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle} style={{ marginBottom: "1rem" }}>
              Recruiter Quick Tools
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
                <span>Post New Job Opening</span>
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
                <span>Search Verified Candidates</span>
              </Link>

              <Link
                to="/dashboard/recruiter/applications"
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
                <span>Screen & Review Applicants</span>
              </Link>
            </div>
          </div>

          {/* Direct Invitations Tracker */}
          <div className={styles.formCard}>
            <div className={styles.cardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Candidate Invitations</h2>
                <p className={styles.cardSubtitle}>
                  Recent direct outreach to talent
                </p>
              </div>
              <Link
                to="/candidates"
                style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}
              >
                Invite More
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "#fef3c7", textAlign: "center" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#d97706" }}>
                  {stats.pendingInvitations || 0}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#b45309" }}>Pending Response</div>
              </div>

              <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", backgroundColor: "#ecfdf5", textAlign: "center" }}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#059669" }}>
                  {stats.acceptedInvitations || 0}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#047857" }}>Accepted</div>
              </div>
            </div>

            {recentInvitations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.25rem", color: "var(--slate-400)", fontSize: "0.875rem" }}>
                No invitations sent yet. Search candidates and click "Invite to Apply" to engage talent directly.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {recentInvitations.map((inv) => (
                  <div
                    key={inv._id}
                    style={{
                      padding: "0.75rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--slate-50)",
                      border: "1px solid var(--border-light)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, color: "var(--slate-900)" }}>
                        {inv.candidateId?.name || "Candidate"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: inv.status === "accepted" ? "#ecfdf5" : inv.status === "pending" ? "#fef3c7" : "#f1f5f9",
                          color: inv.status === "accepted" ? "#059669" : inv.status === "pending" ? "#d97706" : "#64748b",
                          textTransform: "capitalize",
                        }}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "0.25rem" }}>
                      Invited to: {inv.jobId?.title || "Job Position"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Affiliation / Company Card */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle} style={{ marginBottom: "0.5rem" }}>
              Company Affiliation
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--slate-100)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "var(--primary-700)",
                  fontSize: "1.125rem",
                  overflow: "hidden",
                }}
              >
                {profile.company?.logo ? (
                  <img
                    src={profile.company.logo}
                    alt={profile.company.companyName}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  profile.company?.companyName?.charAt(0).toUpperCase() || profile.companyName?.charAt(0).toUpperCase() || "C"
                )}
              </div>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                  {profile.company?.companyName || profile.companyName || "Independent Recruiter"}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
                  {profile.jobTitle || "Recruiter"} • {profile.department || "Talent Acquisition"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <Link
                to="/profile/recruiter"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--primary-600)",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <span>Edit Recruiter Profile & Company Link</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
