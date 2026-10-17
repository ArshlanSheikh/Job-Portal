import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Building,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDropdownOpen(false);
      setMobileMenuOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getDashboardPath = () => {
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

  const getProfilePath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "candidate":
        return "/profile/candidate";
      case "recruiter":
        return "/profile/recruiter";
      case "employer":
        return "/profile/employer";
      default:
        return "/";
    }
  };

  const getRoleBadgeClass = () => {
    if (!user) return "";
    switch (user.role) {
      case "candidate":
        return styles.roleCandidate;
      case "recruiter":
        return styles.roleRecruiter;
      case "employer":
        return styles.roleEmployer;
      default:
        return "";
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        {/* Brand */}
        <Link to="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <Briefcase size={20} />
          </div>
          <span>
            Talent<span className={styles.brandHighlight}>Forge</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav>
          <ul className={styles.navLinks}>
            <li>
              <Link
                to="/jobs"
                className={`${styles.navLink} ${
                  location.pathname === "/jobs" ? styles.activeLink : ""
                }`}
              >
                Explore Jobs
              </Link>
            </li>
            <li>
              <Link
                to="/companies"
                className={`${styles.navLink} ${
                  location.pathname === "/companies" ? styles.activeLink : ""
                }`}
              >
                Top Companies
              </Link>
            </li>
            {(user?.role === "recruiter" || user?.role === "employer") && (
              <li>
                <Link
                  to="/candidates"
                  className={`${styles.navLink} ${
                    location.pathname === "/candidates" ? styles.activeLink : ""
                  }`}
                >
                  Find Talent
                </Link>
              </li>
            )}
            <li>
              <Link to="/#how-it-works" className={styles.navLink}>
                How It Works
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right side: Auth / User Menu */}
        <div className={styles.authActions}>
          {isAuthenticated && user ? (
            <>
              <NotificationDropdown />

              <div className={styles.userMenu} ref={dropdownRef}>
                <button
                  type="button"
                  className={styles.userBadge}
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={styles.userAvatar}
                    />
                  ) : (
                    <div className={styles.userAvatar}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={styles.userName}>{user.name}</span>
                  <span className={`${styles.roleTag} ${getRoleBadgeClass()}`}>
                    {user.role}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <Link to={getDashboardPath()} className={styles.dropdownItem}>
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
                    </Link>
                    <Link to={getProfilePath()} className={styles.dropdownItem}>
                      {user.role === "employer" ? (
                        <Building size={16} />
                      ) : user.role === "recruiter" ? (
                        <UserCheck size={16} />
                      ) : (
                        <User size={16} />
                      )}
                      <span>
                        {user.role === "employer"
                          ? "Company Profile"
                          : "My Profile"}
                      </span>
                    </Link>

                    {/* Stage 2 Candidate Links */}
                    {user.role === "candidate" && (
                      <>
                        <Link to="/applications" className={styles.dropdownItem}>
                          <Briefcase size={16} />
                          <span>My Applications</span>
                        </Link>
                        <Link to="/saved-jobs" className={styles.dropdownItem}>
                          <Briefcase size={16} />
                          <span>Saved Openings</span>
                        </Link>
                        <Link to="/invitations" className={styles.dropdownItem}>
                          <Briefcase size={16} />
                          <span>Direct Invitations</span>
                        </Link>
                      </>
                    )}

                    {/* Stage 2 Recruiter / Employer Links */}
                    {(user.role === "recruiter" || user.role === "employer") && (
                      <>
                        <Link
                          to={
                            user.role === "recruiter"
                              ? "/dashboard/recruiter/jobs"
                              : "/dashboard/employer/jobs"
                          }
                          className={styles.dropdownItem}
                        >
                          <Briefcase size={16} />
                          <span>Manage Jobs</span>
                        </Link>
                        <Link to="/jobs/create" className={styles.dropdownItem}>
                          <Briefcase size={16} />
                          <span>Post New Job</span>
                        </Link>
                        <Link
                          to={
                            user.role === "recruiter"
                              ? "/dashboard/recruiter/applications"
                              : "/dashboard/employer/applications"
                          }
                          className={styles.dropdownItem}
                        >
                          <Briefcase size={16} />
                          <span>Review Applicants</span>
                        </Link>
                      </>
                    )}

                    <div className={styles.dropdownDivider} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>
                Sign In
              </Link>
              <Link to="/register" className={styles.registerBtn}>
                <span>Get Started</span>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileNavDrawer}>
          <Link to="/" className={styles.navLink}>
            Explore Jobs
          </Link>
          <Link to="/companies" className={styles.navLink}>
            Top Companies
          </Link>
          {isAuthenticated && user ? (
            <>
              <Link to={getDashboardPath()} className={styles.navLink}>
                Dashboard
              </Link>
              <Link to={getProfilePath()} className={styles.navLink}>
                {user.role === "employer" ? "Company Profile" : "Profile Settings"}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutItem}
                style={{ textAlign: "left", padding: "0.5rem 0", fontWeight: 600 }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
              <Link to="/login" className={styles.loginBtn} style={{ textAlign: "center" }}>
                Sign In
              </Link>
              <Link to="/register" className={styles.registerBtn} style={{ justifyContent: "center" }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
