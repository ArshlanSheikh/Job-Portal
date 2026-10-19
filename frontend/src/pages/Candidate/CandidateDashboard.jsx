import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Briefcase,
  Bookmark,
  TrendingUp,
  Search,
  ArrowRight,
  Clock,
  Bell,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  candidateService,
  invitationService,
  notificationService,
} from "../../services/api";
import styles from "./Candidate.module.css";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await candidateService.getDashboardData();
      if (res.data?.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch candidate dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRespondInvitation = async (invitationId, action) => {
    if (action === "decline" && !window.confirm("Are you sure you want to decline this job invitation?")) {
      return;
    }

    try {
      setActionLoading(true);
      await invitationService.respondToInvitation(invitationId, action);
      setFeedbackMessage({
        type: "success",
        text: `Invitation ${action === "accept" ? "accepted" : "declined"} successfully.`,
      });
      // Refresh dashboard data
      fetchDashboard();
    } catch (err) {
      setFeedbackMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update invitation status.",
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  const handleMarkAllNotifications = async () => {
    try {
      await notificationService.markAllAsRead();
      setDashboardData((prev) => ({
        ...prev,
        stats: { ...prev.stats, unreadNotificationsCount: 0 },
        recentNotifications: prev.recentNotifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)", fontWeight: 500 }}>
          Loading your candidate workspace...
        </p>
      </div>
    );
  }

  const profile = dashboardData?.profile || {};
  const stats = dashboardData?.stats || {};
  const recommendedJobs = dashboardData?.recommendedJobs || [];
  const recentJobs = dashboardData?.recentJobs || [];
  const recentApplications = dashboardData?.recentApplications || [];
  const recentInvitations = dashboardData?.recentInvitations || [];
  const recentNotifications = dashboardData?.recentNotifications || [];

  const completion = profile?.completionPercentage || 25;

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
      case "Withdrawn":
        return { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
      case "Under Review":
        return { bg: "#fefce8", color: "#ca8a04", border: "#fef08a" };
      default:
        return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
    }
  };

  return (
    <div>
      {/* Top Feedback Toast */}
      {feedbackMessage && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            marginBottom: "1.5rem",
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
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Welcome back, {user?.name || "Candidate"}</h1>
          <p className={styles.pageSubtitle}>
            Your real-time recruitment command center: manage applications, track interviews, and discover matches
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/jobs" className={styles.saveBtnFixed} style={{ backgroundColor: "var(--primary-color)" }}>
            <Search size={16} />
            <span>Search Jobs</span>
          </Link>
          <Link to="/profile/candidate" className={styles.saveBtnFixed} style={{ backgroundColor: "#ffffff", color: "var(--slate-800)", border: "1px solid var(--border-light)" }}>
            <User size={16} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Profile Strength Progress Card */}
      <div className={styles.progressCard}>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressLabelRow}>
            <span>Profile Completion Strength</span>
            <span style={{ color: "var(--primary-700)" }}>{completion}% Complete</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${completion}%` }}
            />
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "0.5rem" }}>
            {completion < 75
              ? "Tip: Uploading a resume and listing your technical skills boosts recruiter discovery by up to 4x."
              : "Excellent profile strength! Your profile is actively highlighted in recruiter talent searches."}
          </p>
        </div>

        <Link
          to="/profile/candidate"
          style={{
            whiteSpace: "nowrap",
            padding: "0.625rem 1.25rem",
            backgroundColor: "var(--primary-50)",
            color: "var(--primary-700)",
            fontWeight: 600,
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
            textDecoration: "none",
            border: "1px solid var(--primary-200)",
          }}
        >
          Enhance Profile
        </Link>
      </div>

      {/* Metrics & Statistics Grid */}
      <div className={styles.statsGrid}>
        <Link to="/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{stats.totalApplications || 0}</div>
            <div className={styles.statLabel}>Total Applications</div>
          </div>
        </Link>

        <Link to="/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ backgroundColor: "#fefce8", color: "#ca8a04" }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{stats.underReviewApplications || 0}</div>
            <div className={styles.statLabel}>Under Review</div>
          </div>
        </Link>

        <Link to="/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{stats.shortlistedApplications || 0}</div>
            <div className={styles.statLabel}>Shortlisted</div>
          </div>
        </Link>

        <Link to="/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>
              {(stats.interviewApplications || 0) + (stats.offerApplications || 0)}
            </div>
            <div className={styles.statLabel}>Interviews & Offers</div>
          </div>
        </Link>
      </div>

      {/* 2-Column Dashboard Main Section */}
      <div className={styles.dashboardGrid}>
        {/* Left Column (Primary Features) */}
        <div className={styles.dashboardColumn}>
          {/* Recommended Jobs Based on Profile */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Recommended for You</h2>
                <p className={styles.cardSubtitle}>
                  Tailored matches based on your skills, experience, and role preferences
                </p>
              </div>
              <Link to="/jobs" style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}>
                Browse All ({recentJobs.length > 0 ? "Live" : "Jobs"})
              </Link>
            </div>

            {recommendedJobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--slate-500)" }}>
                <Search size={36} color="#94a3b8" style={{ marginBottom: "0.75rem" }} />
                <h3 style={{ fontSize: "1.0625rem", color: "var(--slate-800)", fontWeight: 600 }}>No specific matches yet</h3>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  Add your verified skills and preferred job titles in your profile to unlock custom recommendations.
                </p>
                <Link to="/jobs" className={styles.addRowBtn} style={{ marginTop: "1rem" }}>
                  <span>Explore All Openings</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {recommendedJobs.map((job) => {
                  const company = job.company;
                  return (
                    <div key={job._id} className={styles.jobCardMini}>
                      <div className={styles.jobCardMiniHeader}>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                          <div className={styles.companyMiniLogo}>
                            {company?.logo ? (
                              <img
                                src={company.logo}
                                alt={company.companyName}
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              />
                            ) : (
                              company?.companyName?.charAt(0).toUpperCase() || "C"
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/jobs/${job._id}`}
                              style={{
                                fontSize: "1.0625rem",
                                fontWeight: 700,
                                color: "var(--slate-900)",
                                textDecoration: "none",
                              }}
                            >
                              {job.title}
                            </Link>
                            <div style={{ fontSize: "0.875rem", color: "var(--slate-500)", marginTop: "0.125rem" }}>
                              {company?.companyName || "Organization"} • {job.location || "Remote"}
                            </div>
                          </div>
                        </div>

                        {recentApplications.some(
                          (app) => app.jobId?._id === job._id || app.jobId === job._id
                        ) ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.8125rem",
                              fontWeight: 700,
                              color: "#065f46",
                              backgroundColor: "#ecfdf5",
                              border: "1px solid #10b981",
                              padding: "0.3rem 0.65rem",
                              borderRadius: "var(--radius-sm)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Applied</span>
                          </span>
                        ) : (
                          <Link
                            to={`/jobs/${job._id}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.375rem",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              color: "var(--primary-600)",
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span>Apply Now</span>
                            <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>

                      {/* Meta badges: Workplace, Type, Salary */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.8125rem" }}>
                        <span
                          style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--slate-100)",
                            color: "var(--slate-700)",
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        >
                          {job.workplaceType}
                        </span>
                        <span
                          style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--slate-100)",
                            color: "var(--slate-700)",
                            fontWeight: 500,
                            textTransform: "capitalize",
                          }}
                        >
                          {job.employmentType}
                        </span>
                        {job.salaryRange && (job.salaryRange.min > 0 || job.salaryRange.max > 0) && (
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: "var(--radius-sm)",
                              backgroundColor: "#ecfdf5",
                              color: "#059669",
                              fontWeight: 600,
                            }}
                          >
                            ${job.salaryRange.min?.toLocaleString()} - ${job.salaryRange.max?.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Skills Tags */}
                      {job.skills && job.skills.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                          {job.skills.slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: "0.75rem",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "var(--radius-full)",
                                backgroundColor: "var(--primary-50)",
                                color: "var(--primary-700)",
                                fontWeight: 500,
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span style={{ fontSize: "0.75rem", color: "var(--slate-400)", alignSelf: "center" }}>
                              +{job.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Applications Pipeline */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Recent Applications</h2>
                <p className={styles.cardSubtitle}>
                  Track your active application statuses and employer responses
                </p>
              </div>
              <Link to="/applications" style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}>
                View All ({stats.totalApplications || 0})
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--slate-500)" }}>
                <Briefcase size={36} color="#94a3b8" style={{ marginBottom: "0.75rem" }} />
                <h3 style={{ fontSize: "1.0625rem", color: "var(--slate-800)", fontWeight: 600 }}>No applications submitted yet</h3>
                <p style={{ fontSize: "0.875rem", marginTop: "0.25rem" }}>
                  When you apply to jobs, your submissions and stage transitions will be tracked here live.
                </p>
                <Link to="/jobs" className={styles.addRowBtn} style={{ marginTop: "1rem" }}>
                  <span>Find Opportunities</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentApplications.map((app) => {
                  const job = app.jobId;
                  const company = app.companyId;
                  const stStyle = getStatusColor(app.status);

                  return (
                    <div key={app._id} className={styles.appItemRow}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "var(--slate-100)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--slate-600)",
                            fontWeight: 700,
                          }}
                        >
                          <Briefcase size={16} />
                        </div>
                        <div>
                          <Link
                            to={job ? `/jobs/${job._id}` : "#"}
                            style={{
                              fontSize: "0.9375rem",
                              fontWeight: 600,
                              color: "var(--slate-900)",
                              textDecoration: "none",
                            }}
                          >
                            {job?.title || "Job Opening"}
                          </Link>
                          <div style={{ fontSize: "0.8125rem", color: "var(--slate-500)" }}>
                            {company?.companyName || "Company"} • Applied on{" "}
                            {new Date(app.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Actions, Invitations, Notifications) */}
        <div className={styles.dashboardColumn}>
          {/* Quick Actions Panel */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle} style={{ marginBottom: "1rem" }}>
              Quick Actions
            </h2>
            <div className={styles.quickActionsGrid}>
              <Link to="/profile/candidate" className={styles.quickActionCard}>
                <User size={18} style={{ color: "var(--primary-600)" }} />
                <span>Edit Profile</span>
              </Link>
              <Link to="/jobs" className={styles.quickActionCard}>
                <Search size={18} style={{ color: "var(--primary-600)" }} />
                <span>Search Jobs</span>
              </Link>
              <Link to="/saved-jobs" className={styles.quickActionCard}>
                <Bookmark size={18} style={{ color: "#d97706" }} />
                <span>Saved Jobs ({stats.savedJobsCount || 0})</span>
              </Link>
              <Link to="/invitations" className={styles.quickActionCard}>
                <TrendingUp size={18} style={{ color: "#2563eb" }} />
                <span>Invitations ({stats.invitationsCount || 0})</span>
              </Link>
            </div>
          </div>

          {/* Direct Recruiter Invitations */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <div>
                <h2 className={styles.cardTitle}>Direct Invitations</h2>
                <p className={styles.cardSubtitle}>
                  Recruiters inviting you to apply directly
                </p>
              </div>
              <Link to="/invitations" style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600, textDecoration: "none" }}>
                View All
              </Link>
            </div>

            {recentInvitations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "var(--slate-500)", fontSize: "0.875rem" }}>
                No active invitations. Recruiters will invite you directly when your skills match their open requisitions.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {recentInvitations.map((inv) => (
                  <div key={inv._id} className={styles.invitationMini}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                          {inv.jobId?.title || "Position Invitation"}
                        </h4>
                        <div style={{ fontSize: "0.8125rem", color: "var(--slate-600)" }}>
                          from {inv.companyId?.companyName || "Organization"} ({inv.recruiterId?.name || "Recruiter"})
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: inv.status === "pending" ? "#fef3c7" : inv.status === "accepted" ? "#ecfdf5" : "#f1f5f9",
                          color: inv.status === "pending" ? "#d97706" : inv.status === "accepted" ? "#059669" : "#64748b",
                          textTransform: "capitalize",
                        }}
                      >
                        {inv.status}
                      </span>
                    </div>

                    {inv.message && (
                      <p style={{ fontSize: "0.8125rem", color: "var(--slate-600)", fontStyle: "italic", lineHeight: 1.4 }}>
                        "{inv.message}"
                      </p>
                    )}

                    {inv.status === "pending" && (
                      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleRespondInvitation(inv._id, "accept")}
                          style={{
                            flex: 1,
                            padding: "0.4rem 0.75rem",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "var(--primary-600)",
                            color: "#ffffff",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleRespondInvitation(inv._id, "decline")}
                          style={{
                            padding: "0.4rem 0.75rem",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "#ffffff",
                            color: "var(--slate-600)",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            border: "1px solid var(--border-light)",
                            cursor: "pointer",
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent In-App Notifications */}
          <div className={styles.formCard}>
            <div className={styles.formCardHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Bell size={18} style={{ color: "var(--primary-600)" }} />
                <h2 className={styles.cardTitle}>Activity Alerts</h2>
              </div>
              {stats.unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllNotifications}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary-600)",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Mark read
                </button>
              )}
            </div>

            {recentNotifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "var(--slate-400)", fontSize: "0.875rem" }}>
                No notifications right now.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {recentNotifications.map((notif) => (
                  <div key={notif._id} className={styles.notificationMini}>
                    <div
                      style={{
                        width: "0.5rem",
                        height: "0.5rem",
                        borderRadius: "50%",
                        backgroundColor: notif.isRead ? "transparent" : "var(--primary-600)",
                        marginTop: "0.35rem",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: notif.isRead ? 500 : 700, color: "var(--slate-900)" }}>
                        {notif.title}
                      </div>
                      <div style={{ color: "var(--slate-600)", fontSize: "0.8125rem", marginTop: "0.125rem" }}>
                        {notif.message}
                      </div>
                      <div style={{ color: "var(--slate-400)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
