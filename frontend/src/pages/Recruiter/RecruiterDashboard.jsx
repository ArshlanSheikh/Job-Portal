import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UserCheck,
  Building,
  Users,
  Briefcase,
  Search,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { recruiterService } from "../../services/api";
import styles from "./Recruiter.module.css";

const RecruiterDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const [profRes, jobsRes, appsRes] = await Promise.allSettled([
          recruiterService.getMyProfile(),
          jobService.getMyCompanyJobs({ limit: 1 }),
          applicationService.getRecruiterAllApplications({ limit: 1 }),
        ]);

        if (profRes.status === "fulfilled" && profRes.value.data?.success) {
          setProfile(profRes.value.data.data);
        }
        if (jobsRes.status === "fulfilled" && jobsRes.value.data?.success) {
          setActiveJobsCount(jobsRes.value.data.data?.total || 0);
        }
        if (appsRes.status === "fulfilled" && appsRes.value.data?.success) {
          setApplicationsCount(appsRes.value.data.data?.total || 0);
        }
      } catch (err) {
        console.error("Failed to load recruiter data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)" }}>Loading recruiter workspace...</p>
      </div>
    );
  }

  return (
    <div className={styles.recruiterContainer}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Recruiter Hub</h1>
          <p className={styles.subtitle}>
            Manage your recruiter presence, company affiliation, and candidate pipelines
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link to="/jobs/create" className={styles.saveBtn} style={{ background: "var(--primary-color)", color: "white" }}>
            <PlusCircle size={16} />
            <span>Post Opening</span>
          </Link>
          <Link to="/profile/recruiter" className={styles.saveBtn}>
            <UserCheck size={16} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Link to="/dashboard/recruiter/jobs" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{activeJobsCount}</div>
            <div className={styles.statLabel}>Active Requisitions</div>
          </div>
        </Link>

        <Link to="/dashboard/recruiter/applications" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            <Users size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{applicationsCount}</div>
            <div className={styles.statLabel}>Total Applicants</div>
          </div>
        </Link>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            <Building size={22} />
          </div>
          <div>
            <div className={styles.statValue}>
              {profile?.company?.companyName || profile?.companyName ? "Linked" : "Independent"}
            </div>
            <div className={styles.statLabel}>Company Affiliation</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className={styles.statValue}>Verified</div>
            <div className={styles.statLabel}>Account Standing</div>
          </div>
        </div>
      </div>

      {/* Quick Action Operations */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Recruitment Operations</h2>
            <p className={styles.cardSubtitle}>
              Quick access to candidate discovery, job requisitions, and application reviews
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          <Link
            to="/jobs/create"
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--slate-50)",
              border: "1px solid var(--border-light)",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <PlusCircle size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Post New Job Opening
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Draft, customize, and publish positions with tailored skills and salary ranges.
            </p>
          </Link>

          <Link
            to="/candidates"
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--slate-50)",
              border: "1px solid var(--border-light)",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Search size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Candidate Discovery
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Search verified talent by technical skills, experience, and invite them directly to apply.
            </p>
          </Link>

          <Link
            to="/dashboard/recruiter/applications"
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--slate-50)",
              border: "1px solid var(--border-light)",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Users size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Screen Applicants
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Review resumes, cover letters, and advance candidates through recruitment stages.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
