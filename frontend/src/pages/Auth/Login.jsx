import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Auth.module.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email: email.trim(), password });

      if (res && res.success) {
        const userRole = res.data.user.role;
        // If there was a redirect destination, use it, else role dashboard
        const redirectPath =
          location.state?.from?.pathname ||
          (userRole === "candidate"
            ? "/dashboard/candidate"
            : userRole === "recruiter"
            ? "/dashboard/recruiter"
            : "/dashboard/employer");

        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.authTitle}>Welcome Back</h1>
          <p className={styles.authSubtitle}>
            Sign in to access your recruitment portal
          </p>
        </div>

        {errorMessage && (
          <div className={`${styles.alertBox} ${styles.alertDanger}`}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="login-email" className={styles.formLabel}>
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                id="login-email"
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

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="login-password" className={styles.formLabel}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
                autoComplete="current-password"
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
                <span>Sign In</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <span>Don't have an account yet?</span>
          <Link to="/register" className={styles.authLink}>
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
