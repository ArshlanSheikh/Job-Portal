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
import { companyService } from "../../services/api";
import styles from "./Employer.module.css";

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const res = await companyService.getMyCompany();
        if (res.data && res.data.success) {
          setCompany(res.data.data);
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
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "var(--primary-50)", color: "var(--primary-600)" }}
          >
            <Briefcase size={22} />
          </div>
          <div>
            <div className={styles.statValue}>0</div>
            <div className={styles.statLabel}>Active Openings</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
          >
            <Users size={22} />
          </div>
          <div>
            <div className={styles.statValue}>1</div>
            <div className={styles.statLabel}>Hiring Admins</div>
          </div>
        </div>

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

      {/* Stage 2 Employer Roadmap */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Stage 2 Employer Capabilities</h2>
            <p className={styles.cardSubtitle}>
              Features coming in Stage 2 to streamline enterprise talent acquisition
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
              <PlusCircle size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Publish Job Postings
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Create rich job requisitions with salary ranges, required skill tags, and custom screening questions.
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
              <Users size={18} style={{ color: "var(--primary-600)" }} />
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                Recruiter Delegation & Teams
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", lineHeight: 1.5 }}>
              Authorize affiliated recruiters to source and screen applicants directly under your brand.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
