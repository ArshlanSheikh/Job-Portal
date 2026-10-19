import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Building,
  History,
  ArrowRight,
} from "lucide-react";
import { applicationService } from "../../services/api";
import styles from "./MyApplications.module.css";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getMyApplications();
      if (res.data?.success) {
        setApplications(res.data.data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      return;
    }

    try {
      await applicationService.withdrawApplication(appId);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status: "Withdrawn" } : app
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to withdraw application");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Applied":
        return styles.statusApplied;
      case "Under Review":
        return styles.statusUnderReview;
      case "Shortlisted":
        return styles.statusShortlisted;
      case "Interview":
        return styles.statusInterview;
      case "Offered":
        return styles.statusOffered;
      case "Hired":
        return styles.statusHired;
      case "Rejected":
        return styles.statusRejected;
      case "Withdrawn":
        return styles.statusWithdrawn;
      default:
        return styles.statusApplied;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>My Job Applications</h1>
        <p className={styles.subtitle}>
          Track your active application stages, review interview statuses, and check recruiter feedback.
        </p>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <p>Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className={styles.emptyState}>
          <Briefcase size={40} color="#94a3b8" style={{ marginBottom: "1rem" }} />
          <h2 className={styles.emptyTitle}>No applications submitted yet</h2>
          <p className={styles.emptyText}>
            You haven't applied to any job openings yet. Explore verified listings and find your next opportunity!
          </p>
          <Link to="/jobs" className={styles.exploreBtn} style={{ margin: "0 auto" }}>
            <span>Explore Jobs</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className={styles.appList}>
          {applications.map((app) => {
            const job = app.jobId;
            const company = app.companyId;
            const canWithdraw =
              app.status !== "Withdrawn" &&
              app.status !== "Hired" &&
              app.status !== "Rejected";

            return (
              <article key={app._id} className={styles.appCard}>
                <div className={styles.cardTop}>
                  <div className={styles.companyInfo}>
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt={company.companyName}
                        className={styles.companyLogo}
                      />
                    ) : (
                      <div className={styles.companyLogo} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Building size={20} color="#94a3b8" />
                      </div>
                    )}

                    <div>
                      {job ? (
                        <Link to={`/jobs/${job._id}`} className={styles.jobTitle}>
                          {job.title}
                        </Link>
                      ) : (
                        <div className={styles.jobTitle}>Requisition Closed</div>
                      )}
                      <div className={styles.companyName}>
                        {company?.companyName || "Organization"}
                      </div>
                    </div>
                  </div>

                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                {/* Timeline History */}
                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className={styles.timelineSection}>
                    <div className={styles.timelineTitle}>
                      <History size={14} style={{ display: "inline", marginRight: "0.4rem" }} />
                      <span>Application Timeline</span>
                    </div>

                    <div className={styles.timeline}>
                      {app.statusHistory.map((step, idx) => (
                        <div key={idx} className={styles.timelineItem}>
                          <span className={styles.timelineDot} />
                          <span>
                            <strong>{step.status}</strong>
                            {step.note ? ` — ${step.note}` : ""}
                          </span>
                          <span className={styles.timelineDate}>
                            {new Date(step.changedAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div style={{ fontSize: "0.88rem", color: "var(--text-muted)" }}>
                    Submitted on {new Date(app.createdAt).toLocaleDateString()}
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    {job && (
                      <Link
                        to={`/jobs/${job._id}`}
                        style={{
                          color: "var(--primary-color)",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          textDecoration: "none",
                        }}
                      >
                        View Job Details →
                      </Link>
                    )}

                    {canWithdraw && (
                      <button
                        type="button"
                        className={styles.withdrawBtn}
                        onClick={() => handleWithdraw(app._id)}
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
