import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import styles from "./ErrorPage.module.css";

const Unauthorized = () => {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "candidate":
        return "/dashboard/candidate";
      case "recruiter":
        return "/dashboard/recruiter";
      case "employer":
        return "/dashboard/employer";
      default:
        return "/";
    }
  };

  return (
    <div className={styles.errorWrapper}>
      <div className={styles.errorCard}>
        <div className={`${styles.iconWrapper} ${styles.iconDanger}`}>
          <ShieldAlert size={32} />
        </div>
        <span className={styles.errorCode}>Error 403 • Forbidden Access</span>
        <h1 className={styles.errorTitle}>Restricted Access Permission</h1>
        <p className={styles.errorDesc}>
          You do not have the required permissions to view this resource. Your account role
          is <strong style={{ color: "var(--slate-800)" }}>'{user?.role || "Guest"}'</strong>, which
          does not have authorization for this area.
        </p>

        <div className={styles.actionRow}>
          <Link to={getDashboardLink()} className={styles.primaryBtn}>
            <Home size={16} />
            <span>Go to Your Dashboard</span>
          </Link>
          <Link to="/" className={styles.secondaryBtn}>
            <ArrowLeft size={16} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
