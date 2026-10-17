import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Trash2,
  MapPin,
  Briefcase,
} from "lucide-react";
import { savedJobService } from "../../services/api";
import styles from "./SavedJobs.module.css";

const SavedJobs = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await savedJobService.getMySavedJobs({ limit: 50 });
      if (res.data?.success) {
        setSavedItems(res.data.data.savedJobs || []);
      }
    } catch (err) {
      console.error("Failed to load saved jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedJobs();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await savedJobService.unsaveJob(jobId);
      setSavedItems((prev) => prev.filter((item) => item.jobId?._id !== jobId));
    } catch (err) {
      alert("Failed to unsave job opening");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Saved Openings</h1>
        <p className={styles.subtitle}>
          Access roles you have bookmarked for later review or application.
        </p>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <p>Loading your saved jobs...</p>
        </div>
      ) : savedItems.length === 0 ? (
        <div className={styles.emptyState}>
          <Bookmark size={40} color="#94a3b8" style={{ marginBottom: "1rem" }} />
          <h2 className={styles.emptyTitle}>No saved jobs yet</h2>
          <p className={styles.emptyText}>
            Keep track of interesting positions by clicking the bookmark icon on any job card.
          </p>
          <Link
            to="/jobs"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--primary-color)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <span>Explore Jobs</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className={styles.savedGrid}>
          {savedItems.map((item) => {
            const job = item.jobId;
            if (!job) return null;

            return (
              <div key={item._id} className={styles.jobCard}>
                <div className={styles.cardTop}>
                  <div>
                    <Link to={`/jobs/${job._id}`} className={styles.jobTitle}>
                      {job.title}
                    </Link>
                    <div className={styles.companyName}>
                      {job.company?.companyName || "Organization"}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.unsaveBtn}
                    title="Remove from saved"
                    onClick={() => handleUnsave(job._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className={styles.badgeRow}>
                  {job.workplaceType && (
                    <span className={styles.badge}>
                      {job.workplaceType.toUpperCase()}
                    </span>
                  )}
                  {job.employmentType && (
                    <span className={styles.badge}>{job.employmentType}</span>
                  )}
                  {job.location && (
                    <span className={styles.badge}>
                      <MapPin size={11} style={{ display: "inline", marginRight: "2px" }} />
                      {job.location}
                    </span>
                  )}
                </div>

                <div className={styles.cardFooter}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Saved {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <Link to={`/jobs/${job._id}`} className={styles.viewBtn}>
                    <span>View Opening</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
