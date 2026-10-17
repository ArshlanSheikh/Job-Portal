import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Users,
  Briefcase,
  TrendingUp,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { companyService, jobService, applicationService } from "../../services/api";
import styles from "./Employer.module.css";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const [compRes, jobsRes, appsRes] = await Promise.allSettled([
          companyService.getMyCompany(),
          jobService.getMyCompanyJobs({ limit: 1 }),
          applicationService.getRecruiterAllApplications({ limit: 1 }),
        ]);

        if (compRes.status === "fulfilled" && compRes.value.data?.success) {
          setCompany(compRes.value.data.data);
        }
        if (jobsRes.status === "fulfilled" && jobsRes.value.data?.success) {
          setActiveJobsCount(jobsRes.value.data.data?.total || 0);
        }
        if (appsRes.status === "fulfilled" && appsRes.value.data?.success) {
          setApplicationsCount(appsRes.value.data.data?.total || 0);
        }
      } catch (err) {
        console.error("Failed to load company profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)" }}>Loading employer workspace...</p>
      </div>
    );
  }

  return (
    <div className={styles.employerContainer}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Employer Command Center</h1>
          <p className={styles.subtitle}>
            Welcome back, {user?.name || "Employer"}. Manage your organization branding and hiring performance
          </p>
        </div>
        <Link to="/profile/employer" className={styles.saveBtn}>
          <Building size={16} />
          <span>Edit Company Profile</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <Link to="/dashboard/employer/jobs" style={{ textDecoration: "none" }} className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statValue}>{activeJobsCount}</div>
            <div className={styles.statLabel}>Active Openings</div>
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
            <div className={styles.statValue}>{applicationsCount}</div>
            <div className={styles.statLabel}>Candidate Submissions</div>
          </div>
        </Link>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#ecfdf5", color: "#059669" }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div className={styles.statValue}>48</div>
            <div className={styles.statLabel}>Brand Impressions</div>
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
            <div className={styles.statValue}>Active</div>
            <div className={styles.statLabel}>Organization Status</div>
          </div>
        </div>
      </div>

      {/* Company Overview Card */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Company Brand Profile</h2>
            <p className={styles.cardSubtitle}>
              Live organization details visible to candidates and associated recruiters
            </p>
          </div>
          <Link
            to="/profile/employer"
            style={{ fontSize: "0.875rem", color: "var(--primary-600)", fontWeight: 600 }}
          >
            Update Profile
          </Link>
        </div>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div
            style={{
              width: "5rem",
              height: "5rem",
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

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--slate-900)" }}>
                {company?.companyName || "Organization Profile"}
              </h3>
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
                {company?.industry || "Technology"}
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
                <span>{company?.companySize || "11-50 employees"}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <MapPin size={16} style={{ color: "var(--slate-400)" }} />
                <span>{company?.location || "Headquarters not set"}</span>
              </span>
              {company?.website && (
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
                  }}
                >
                  <Globe size={16} />
                  <span>{company.website}</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {company?.description && (
              <p style={{ marginTop: "0.75rem", fontSize: "0.9375rem", color: "var(--slate-600)", lineHeight: 1.5 }}>
                {company.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hiring Operations */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Hiring Operations</h2>
            <p className={styles.cardSubtitle}>
              Streamline enterprise talent acquisition, publish requisitions, and review candidate applications
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
                Publish Job Postings
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Create rich job requisitions with salary ranges, required skill tags, and location requirements.
            </p>
          </Link>

          <Link
            to="/dashboard/employer/jobs"
            style={{
              padding: "1.25rem",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--slate-50)",
              border: "1px solid var(--border-light)",
              textDecoration: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Briefcase size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Manage Company Jobs
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Review active, draft, and closed positions, and monitor applicant counts.
            </p>
          </Link>

          <Link
            to="/dashboard/employer/applications"
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
                Candidate Applications
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Screen candidate submissions, review resumes, and update application stages.
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
              <TrendingUp size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Talent Discovery
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Search verified candidates and invite them to apply directly to your company openings.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
