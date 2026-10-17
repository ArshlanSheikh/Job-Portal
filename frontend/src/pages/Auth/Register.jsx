import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Auth.module.css";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const queryRole = searchParams.get("role");
  const initialRole = ["candidate", "recruiter", "employer"].includes(queryRole)
    ? queryRole
    : "candidate";

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage("Please complete all required fields");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    if (role === "employer" && !companyName.trim()) {
      setErrorMessage("Company name is required for Employer registration");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        phone: phone.trim(),
        companyName: companyName.trim(),
      };

      const res = await register(payload);

      if (res && res.success) {
        if (role === "candidate") {
          navigate("/dashboard/candidate");
        } else if (role === "recruiter") {
          navigate("/dashboard/recruiter");
        } else {
          navigate("/dashboard/employer");
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Registration failed. Please try again with valid details.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfoText = () => {
    switch (role) {
      case "candidate":
        return "Build a standout resume, showcase skills, and discover high-impact jobs.";
      case "recruiter":
        return "Source verified talent, manage candidate pipelines, and represent your firm.";
      case "employer":
        return "Create your organization profile, manage recruitment, and build high-performance teams.";
      default:
        return "";
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Create Your Account</h1>
          <p className={styles.authSubtitle}>
            Join TalentForge as a job seeker, recruiter, or hiring employer
          </p>
        </div>

        {/* Role Selector */}
        <div className={styles.roleSelector}>
          <button
            type="button"
            className={`${styles.roleTab} ${
              role === "candidate" ? styles.roleTabActive : ""
            }`}
            onClick={() => setRole("candidate")}
          >
            <Briefcase size={16} />
            <span>Candidate</span>
          </button>

          <button
            type="button"
            className={`${styles.roleTab} ${
              role === "recruiter" ? styles.roleTabActive : ""
            }`}
            onClick={() => setRole("recruiter")}
          >
            <UserCheck size={16} />
            <span>Recruiter</span>
          </button>

          <button
            type="button"
            className={`${styles.roleTab} ${
              role === "employer" ? styles.roleTabActive : ""
            }`}
            onClick={() => setRole("employer")}
          >
            <Building size={16} />
            <span>Employer</span>
          </button>
        </div>

        {/* Role helper hint */}
        <div className={styles.roleDescription}>
          <span>💡 {getRoleInfoText()}</span>
        </div>

        {errorMessage && (
          <div className={`${styles.alertBox} ${styles.alertDanger}`}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {/* Full Name */}
          <div className={styles.formGroup}>
            <label htmlFor="reg-name" className={styles.formLabel}>
              Full Name *
            </label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="reg-name"
                type="text"
                required
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.formInput}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className={styles.formGroup}>
            <label htmlFor="reg-email" className={styles.formLabel}>
              Email Address *
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="reg-email"
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone (optional) */}
          <div className={styles.formGroup}>
            <label htmlFor="reg-phone" className={styles.formLabel}>
              Phone Number
            </label>
            <div className={styles.inputWrapper}>
              <Phone size={18} className={styles.inputIcon} />
              <input
                id="reg-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.formInput}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Conditional Company Name for Employer / Recruiter */}
          {(role === "employer" || role === "recruiter") && (
            <div className={styles.formGroup}>
              <label htmlFor="reg-company" className={styles.formLabel}>
                {role === "employer" ? "Company / Organization Name *" : "Associated Company or Agency"}
              </label>
              <div className={styles.inputWrapper}>
                <Building size={18} className={styles.inputIcon} />
                <input
                  id="reg-company"
                  type="text"
                  required={role === "employer"}
                  placeholder={
                    role === "employer"
                      ? "e.g. Acme Innovations Corp"
                      : "e.g. Apex Talent Partners or leave blank"
                  }
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="reg-password" className={styles.formLabel}>
              Password *
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <span>Already registered?</span>
          <Link to="/login" className={styles.authLink}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
