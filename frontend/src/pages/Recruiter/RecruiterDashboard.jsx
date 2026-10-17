import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UserCheck,
  Building,
  Users,
  Briefcase,
  Search,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { recruiterService } from "../../services/api";
import styles from "./Recruiter.module.css";

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const res = await recruiterService.getMyProfile();
        if (res.data && res.data.success) {
          setProfile(res.data.data);
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
        <Link to="/profile/recruiter" className={styles.saveBtn}>
          <UserCheck size={16} />
          <span>Edit Recruiter Profile</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Active Requisitions</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            <Users size={22} />
          </div>
          <div>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Sourced Candidates</div>
          </div>
        </div>

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

      {/* Recruiter & Company Summary Card */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Recruiter & Agency Affiliation</h2>
            <p className={styles.cardSubtitle}>
              Your current public recruiter profile and organization link
            </p>
          </div>
          <Link
            to="/profile/recruiter"
            style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600 }}
          >
            Modify Affiliation
          </Link>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div
            style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--primary-50)",
              color: "var(--primary-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              fontWeight: 700,
              overflow: "hidden",
            }}
          >
            {profile?.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={user?.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() || "R"
            )}
          </div>

          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--slate-900)" }}>
              {profile?.fullName || user?.name}
            </h3>
            <p style={{ fontSize: "0.9375rem", color: "var(--slate-600)", marginTop: "0.125rem" }}>
              {profile?.jobTitle || "Recruiter / Talent Specialist"} •{" "}
              {profile?.department || "Talent Acquisition"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <span
                style={{
                  fontSize: "0.8125rem",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--slate-100)",
                  color: "var(--slate-700)",
                  fontWeight: 600,
                }}
              >
                🏢 {profile?.company?.companyName || profile?.companyName || "No Company Selected"}
              </span>
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--primary-600)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <span>LinkedIn</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stage 2 Candidate Pipeline Preview */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Upcoming Stage 2 Candidate Pipeline</h2>
            <p className={styles.cardSubtitle}>
              Candidate search, applicant management, and interview scheduling workflows
            </p>
          </div>
          <span
            style={{
              padding: "0.25rem 0.625rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--primary-50)",
              color: "var(--primary-700)",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            Stage 2 Roadmap
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--slate-50)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Search size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Advanced Candidate Search
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Filter candidates by indexed skills, verified experience, location preferences, and expected salaries in Stage 2.
            </p>
          </div>

          <div
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--slate-50)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <PlusCircle size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Job Requisition Management
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Draft, publish, and track applications on behalf of your affiliated employer or recruitment agency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
