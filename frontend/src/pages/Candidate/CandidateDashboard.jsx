import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Briefcase,
  FileText,
  Bookmark,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  candidateService,
  applicationService,
  savedJobService,
} from "../../services/api";
import styles from "./Candidate.module.css";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profRes, appsRes, savedRes] = await Promise.allSettled([
          candidateService.getMyProfile(),
          applicationService.getMyApplications({ limit: 1 }),
          savedJobService.getMySavedJobs({ limit: 1 }),
        ]);

        if (profRes.status === "fulfilled" && profRes.value.data?.success) {
          setProfile(profRes.value.data.data);
        }
        if (appsRes.status === "fulfilled" && appsRes.value.data?.success) {
          setApplicationsCount(appsRes.value.data.data?.total || 0);
        }
        if (savedRes.status === "fulfilled" && savedRes.value.data?.success) {
          setSavedJobsCount(savedRes.value.data.data?.total || 0);
        }
      } catch (err) {
        console.error("Failed to fetch candidate dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)" }}>Loading candidate workspace...</p>
      </div>
    );
  }

  const completion = profile?.completionPercentage || 25;

  return (
    <div>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Welcome back, {user?.name}</h1>
          <p className={styles.pageSubtitle}>
            Here is your candidate activity snapshot and profile completion status
          </p>
        </div>
        <Link to="/profile/candidate" className={styles.saveBtnFixed}>
          <User size={16} />
          <span>Edit Profile</span>
        </Link>
      </div>

      {/* Profile Completion Card */}
      <div className={styles.progressCard}>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressLabelRow}>
            <span>Profile Strength</span>
            <span>{completion}% Completed</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${completion}%` }}
            />
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--slate-500)", marginTop: "0.5rem" }}>
            {completion < 80
              ? "Complete your skills, education, and resume to maximize discovery by top recruiters."
              : "Excellent profile strength! Your profile is primed for recruiter discovery."}
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
          }}
        >
          Enhance Profile
        </Link>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <Link to="/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{applicationsCount}</div>
            <div className={styles.statLabel}>Active Applications</div>
          </div>
        </Link>

        <Link to="/saved-jobs" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
          >
            <Bookmark size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>{savedJobsCount}</div>
            <div className={styles.statLabel}>Saved Jobs</div>
          </div>
        </Link>

        <Link to="/invitations" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>View</div>
            <div className={styles.statLabel}>Direct Invitations</div>
          </div>
        </Link>

        <Link to="/profile/candidate" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIconWrapper}
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div className={styles.statNumber}>
              {profile?.resume?.fileUrl ? "Uploaded" : "None"}
            </div>
            <div className={styles.statLabel}>Resume Status</div>
          </div>
        </Link>
      </div>

      {/* Profile Summary Card */}
      <div className={styles.formCard} style={{ marginBottom: "2rem" }}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Professional Overview</h2>
            <p className={styles.cardSubtitle}>
              Your current public headline, location, and featured skills
            </p>
          </div>
          <Link to="/profile/candidate" style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600 }}>
            Update
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.8125rem", color: "var(--slate-400)", fontWeight: 600 }}>
              PROFESSIONAL HEADLINE
            </span>
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--slate-800)", marginTop: "0.25rem" }}>
              {profile?.headline || "No headline added yet (e.g., Full Stack Engineer)"}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "0.8125rem", color: "var(--slate-400)", fontWeight: 600 }}>
              LOCATION
            </span>
            <p style={{ fontSize: "0.9375rem", color: "var(--slate-700)", marginTop: "0.25rem" }}>
              {profile?.currentLocation || "Location not specified"}
            </p>
          </div>

          <div>
            <span style={{ fontSize: "0.8125rem", color: "var(--slate-400)", fontWeight: 600 }}>
              VERIFIED SKILLS
            </span>
            <div className={styles.tagList} style={{ marginTop: "0.375rem" }}>
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill) => (
                  <span key={skill} className={styles.tagItem}>
                    {skill}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: "0.875rem", color: "var(--slate-500)" }}>
                  No skills added yet. Go to your profile to list your technical competencies.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Opportunities Teaser */}
      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Curated Role Matches</h2>
            <p className={styles.cardSubtitle}>
              Matching your configured role preferences and skill portfolio
            </p>
          </div>
          <Link to="/" style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600 }}>
            Browse All Jobs
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              role: "Senior React / Node Developer",
              company: "Nova Systems Inc.",
              loc: "Remote, US",
              type: "Full-Time",
            },
            {
              role: "Full-Stack Software Engineer",
              company: "Apex Cloud Services",
              loc: "Hybrid, CA",
              type: "Full-Time",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--slate-50)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                  {item.role}
                </h4>
                <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", marginTop: "0.125rem" }}>
                  {item.company} • {item.loc} • {item.type}
                </p>
              </div>
              <Link
                to="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  color: "var(--primary-600)",
                  fontWeight: 600,
                }}
              >
                <span>View Opening</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
