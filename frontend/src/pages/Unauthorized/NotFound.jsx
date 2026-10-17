import React from "react";
import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import styles from "./ErrorPage.module.css";

const NotFound = () => {
  return (
    <div className={styles.errorWrapper}>
      <div className={styles.errorCard}>
        <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
          <Compass size={32} />
        </div>
        <span className={styles.errorCode}>Error 404 • Page Not Found</span>
        <h1 className={styles.errorTitle}>Destination Unavailable</h1>
        <p className={styles.errorDesc}>
          The page or route you are attempting to access does not exist or may have been
          relocated in our modern talent architecture.
        </p>

        <div className={styles.actionRow}>
          <Link to="/" className={styles.primaryBtn}>
            <Home size={16} />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
