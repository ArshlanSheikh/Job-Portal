import React, { useState, useEffect } from "react";
import { Camera, Check, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { companyService } from "../../services/api";
import styles from "./Employer.module.css";

const EmployerProfile = () => {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [logo, setLogo] = useState("");
  const [industry, setIndustry] = useState("Information Technology");
  const [companySize, setCompanySize] = useState("11-50 employees");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await companyService.getMyCompany();
        if (res.data && res.data.success) {
          const c = res.data.data;
          setCompanyName(c.companyName || "");
          setLogo(c.logo || "");
          setIndustry(c.industry || "Information Technology");
          setCompanySize(c.companySize || "11-50 employees");
          setWebsite(c.website || "");
          setLocation(c.location || "");
          setDescription(c.description || "");
          setFoundedYear(c.foundedYear ? String(c.foundedYear) : "");
          if (c.socialLinks) {
            setLinkedin(c.socialLinks.linkedin || "");
            setTwitter(c.socialLinks.twitter || "");
            setGithub(c.socialLinks.github || "");
          }
        }
      } catch {
        setErrorMessage("Failed to load organization profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!companyName.trim()) {
      setErrorMessage("Company name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        companyName: companyName.trim(),
        logo,
        industry: industry.trim(),
        companySize: companySize.trim(),
        website: website.trim(),
        location: location.trim(),
        description: description.trim(),
        foundedYear: foundedYear ? Number(foundedYear) : null,
        socialLinks: {
          linkedin: linkedin.trim(),
          twitter: twitter.trim(),
          github: github.trim(),
        },
      };

      const res = await companyService.updateMyCompany(payload);
      if (res.data && res.data.success) {
        setSuccessMessage("Company profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to update company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("logo", file);

      const res = await companyService.uploadLogo(formData);
      if (res.data && res.data.success) {
        setLogo(res.data.data.logo);
        setSuccessMessage("Company logo uploaded!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)" }}>Loading company details...</p>
      </div>
    );
  }

  return (
    <div className={styles.employerContainer}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Company Brand & Profile</h1>
          <p className={styles.subtitle}>
            Establish your organization identity, size, industry, and contact channels
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={styles.saveBtn}
        >
          {saving ? (
            <span className="spinner" />
          ) : (
            <>
              <Check size={18} />
              <span>Save Company Profile</span>
            </>
          )}
        </button>
      </div>

      {successMessage && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            backgroundColor: "var(--success-50)",
            border: "1px solid #bbf7d0",
            color: "var(--success-700)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: "0.875rem 1.25rem",
            backgroundColor: "var(--danger-50)",
            border: "1px solid #fecaca",
            color: "var(--danger-600)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Company Identity & Branding</h2>
            <p className={styles.cardSubtitle}>
              Official organization name, logo asset, and primary classification
            </p>
          </div>
        </div>

        {/* Logo and primary fields */}
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "6rem",
                height: "6rem",
                borderRadius: "var(--radius-lg)",
                backgroundColor: "var(--slate-100)",
                color: "var(--primary-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: 700,
                overflow: "hidden",
                border: "2px solid var(--border-light)",
              }}
            >
              {logo ? (
                <img
                  src={logo}
                  alt={companyName}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                companyName.charAt(0).toUpperCase() || "C"
              )}
            </div>

            <label
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--primary-600)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <Camera size={14} />
              <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
            </label>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company / Organization Name *</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Acme Corp"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Industry Sector</label>
                <select
                  className={styles.select}
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="Information Technology">Information Technology</option>
                  <option value="Software & Cloud Services">Software & Cloud Services</option>
                  <option value="Financial Services & FinTech">Financial Services & FinTech</option>
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Consulting & Business Services">Consulting & Business Services</option>
                  <option value="Media & Entertainment">Media & Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company Size</label>
                <select
                  className={styles.select}
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                >
                  <option value="1-10 employees">1-10 employees (Startup / Boutique)</option>
                  <option value="11-50 employees">11-50 employees (Early Growth)</option>
                  <option value="51-200 employees">51-200 employees (Scale-up)</option>
                  <option value="201-500 employees">201-500 employees (Mid-Market)</option>
                  <option value="500+ employees">500+ employees (Enterprise)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Official Website URL</label>
                <input
                  type="url"
                  className={styles.input}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location and Founded Year */}
        <div className={styles.grid2} style={{ marginBottom: "1.25rem" }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Headquarters Location</label>
            <input
              type="text"
              className={styles.input}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote-First"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Founded Year</label>
            <input
              type="number"
              className={styles.input}
              value={foundedYear}
              onChange={(e) => setFoundedYear(e.target.value)}
              placeholder="e.g. 2018"
            />
          </div>
        </div>

        {/* Company Description */}
        <div className={styles.formGroup} style={{ marginBottom: "1.5rem" }}>
          <label className={styles.label}>About the Company (Description)</label>
          <textarea
            className={styles.textarea}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share your company's mission, values, engineering culture, and why top candidates should join..."
          />
        </div>

        {/* Social Presence */}
        <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--border-light)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: "0.5rem" }}>
            Social & Developer Links
          </h3>

          <div className={styles.grid3}>
            <div className={styles.formGroup}>
              <label className={styles.label}>LinkedIn</label>
              <input
                type="url"
                className={styles.input}
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Twitter / X</label>
              <input
                type="url"
                className={styles.input}
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://x.com/..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>GitHub Organization</label>
              <input
                type="url"
                className={styles.input}
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button type="submit" disabled={saving} className={styles.saveBtn}>
            {saving ? <span className="spinner" /> : <span>Update Company Profile</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployerProfile;
