import React, { useState, useEffect } from "react";
import { Camera, Check, AlertCircle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { recruiterService, companyService } from "../../services/api";
import styles from "./Recruiter.module.css";

const RecruiterProfile = () => {
  const { user, updateUserState } = useAuth();

  const [fullName, setFullName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const [department, setDepartment] = useState("");
  const [professionalBio, setProfessionalBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [companiesList, setCompaniesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load recruiter profile
        const profileRes = await recruiterService.getMyProfile();
        if (profileRes.data && profileRes.data.success) {
          const d = profileRes.data.data;
          setFullName(d.fullName || user?.name || "");
          setProfilePhoto(d.profilePhoto || user?.avatar || "");
          setJobTitle(d.jobTitle || "Technical Recruiter");
          setContactPhone(d.contactPhone || user?.phone || "");
          setSelectedCompanyId(d.company?._id || d.company || "");
          setCustomCompanyName(d.companyName || "");
          setDepartment(d.department || "Talent Acquisition");
          setProfessionalBio(d.professionalBio || "");
          setLinkedinUrl(d.linkedinUrl || "");
        }

        // Load registered companies for selection
        const compRes = await companyService.getAllCompanies({ limit: 100 });
        if (compRes.data && compRes.data.success) {
          setCompaniesList(compRes.data.data.companies || []);
        }
      } catch {
        setErrorMessage("Failed to load recruiter profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      setSaving(true);
      const payload = {
        fullName: fullName.trim(),
        jobTitle: jobTitle.trim(),
        contactPhone: contactPhone.trim(),
        department: department.trim(),
        professionalBio: professionalBio.trim(),
        linkedinUrl: linkedinUrl.trim(),
        profilePhoto,
      };

      if (selectedCompanyId && selectedCompanyId !== "custom") {
        payload.company = selectedCompanyId;
      } else {
        payload.company = null;
        payload.companyName = customCompanyName.trim();
      }

      const res = await recruiterService.updateMyProfile(payload);
      if (res.data && res.data.success) {
        setSuccessMessage("Recruiter profile updated successfully!");
        if (user) {
          updateUserState({
            ...user,
            name: fullName.trim(),
            phone: contactPhone.trim(),
            avatar: profilePhoto,
          });
        }
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to update recruiter profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await recruiterService.uploadPhoto(formData);
      if (res.data && res.data.success) {
        setProfilePhoto(res.data.data.profilePhoto);
        if (user) {
          updateUserState({ ...user, avatar: res.data.data.profilePhoto });
        }
        setSuccessMessage("Profile photo uploaded!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
        <p style={{ marginTop: "1rem", color: "var(--slate-500)" }}>Loading recruiter profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.recruiterContainer}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Recruiter Profile Settings</h1>
          <p className={styles.subtitle}>
            Update your public persona, job title, and company/agency affiliation
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
              <span>Save Recruiter Profile</span>
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
            <h2 className={styles.cardTitle}>Professional Identity</h2>
            <p className={styles.cardSubtitle}>
              Basic identification, job title, and profile picture
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "6rem",
                height: "6rem",
                borderRadius: "50%",
                backgroundColor: "var(--primary-100)",
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
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                fullName.charAt(0).toUpperCase() || "R"
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
              <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
              />
            </label>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  disabled
                  className={styles.input}
                  value={user?.email || ""}
                  style={{ backgroundColor: "var(--slate-100)", cursor: "not-allowed" }}
                />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Job Title / Designation</label>
                <input
                  type="text"
                  className={styles.input}
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Lead Talent Acquisition Partner"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Department</label>
                <input
                  type="text"
                  className={styles.input}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering & Product Recruitment"
                />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Phone Number</label>
                <input
                  type="tel"
                  className={styles.input}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  className={styles.input}
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/racheladams"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Company Affiliation */}
        <div style={{ marginTop: "1rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-light)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--slate-900)", marginBottom: "0.5rem" }}>
            Company & Agency Affiliation
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--slate-500)", marginBottom: "1rem" }}>
            Select an existing employer organization on the platform, or enter your agency/firm name.
          </p>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Platform Registered Company</label>
              <select
                className={styles.select}
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value);
                  if (e.target.value && e.target.value !== "custom") {
                    const match = companiesList.find((c) => c._id === e.target.value);
                    if (match) setCustomCompanyName(match.companyName);
                  }
                }}
              >
                <option value="">-- Select Registered Company --</option>
                {companiesList.map((comp) => (
                  <option key={comp._id} value={comp._id}>
                    {comp.companyName} ({comp.industry || "General"})
                  </option>
                ))}
                <option value="custom">Other / Independent Agency / Custom</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Custom or Agency Name</label>
              <input
                type="text"
                className={styles.input}
                value={customCompanyName}
                onChange={(e) => setCustomCompanyName(e.target.value)}
                placeholder="e.g. Apex Talent Solutions LLC"
              />
            </div>
          </div>
        </div>

        {/* Professional Bio */}
        <div style={{ marginTop: "1.5rem" }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Professional Recruiter Bio</label>
            <textarea
              className={styles.textarea}
              rows={4}
              value={professionalBio}
              onChange={(e) => setProfessionalBio(e.target.value)}
              placeholder="Introduce your recruiting focus, industries you hire for, and how candidates can connect with you..."
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button type="submit" disabled={saving} className={styles.saveBtn}>
            {saving ? <span className="spinner" /> : <span>Update Recruiter Profile</span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecruiterProfile;
