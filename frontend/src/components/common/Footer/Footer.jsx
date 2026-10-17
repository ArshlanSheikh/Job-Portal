import React from "react";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import styles from "./Footer.module.css";

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brand}>
              <div className={styles.brandIcon}>
                <Briefcase size={18} />
              </div>
              <span>
                Talent<span className={styles.brandHighlight}>Forge</span>
              </span>
            </Link>
            <p className={styles.brandDesc}>
              The next-generation hiring platform connecting talented candidates,
              active recruiters, and visionary employers across modern industries.
            </p>
          </div>

          {/* Candidates */}
          <div>
            <h4 className={styles.colTitle}>For Candidates</h4>
            <ul className={styles.linkList}>
              <li><Link to="/" className={styles.linkItem}>Explore Job Openings</Link></li>
              <li><Link to="/register" className={styles.linkItem}>Create Candidate Profile</Link></li>
              <li><Link to="/companies" className={styles.linkItem}>Browse Top Employers</Link></li>
              <li><Link to="/" className={styles.linkItem}>Salary Insights</Link></li>
            </ul>
          </div>

          {/* Recruiters & Employers */}
          <div>
            <h4 className={styles.colTitle}>For Employers</h4>
            <ul className={styles.linkList}>
              <li><Link to="/register" className={styles.linkItem}>Post a Job Opportunity</Link></li>
              <li><Link to="/register" className={styles.linkItem}>Recruiter Registration</Link></li>
              <li><Link to="/register" className={styles.linkItem}>Company Profiles</Link></li>
              <li><Link to="/" className={styles.linkItem}>Hiring Solutions</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className={styles.colTitle}>Company</h4>
            <ul className={styles.linkList}>
              <li><Link to="/" className={styles.linkItem}>About TalentForge</Link></li>
              <li><Link to="/" className={styles.linkItem}>Privacy Policy</Link></li>
              <li><Link to="/" className={styles.linkItem}>Terms of Service</Link></li>
              <li><Link to="/" className={styles.linkItem}>Contact Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p>© {CURRENT_YEAR} TalentForge Inc. All rights reserved.</p>
          <p style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            Crafted for modern recruitment workflows
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
