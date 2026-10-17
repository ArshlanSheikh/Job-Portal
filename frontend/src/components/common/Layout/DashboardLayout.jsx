import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Briefcase,
  LayoutDashboard,
  User,
  Building,
  UserCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Bookmark,
  Search,
  PlusCircle,
  Users,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import styles from "./DashboardLayout.module.css";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderNavLinks = () => {
    if (!user) return null;

    if (user.role === "candidate") {
      return (
        <>
          <div className={styles.navHeading}>Menu</div>
          <NavLink
            to="/dashboard/candidate"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <div className={styles.navItemContent}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </div>
          </NavLink>
          <NavLink
            to="/profile/candidate"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <div className={styles.navItemContent}>
              <User size={18} />
              <span>Candidate Profile</span>
            </div>
          </NavLink>

          <div className={styles.navHeading}>Stage 2 Features</div>
          <div className={styles.navItem} style={{ opacity: 0.65 }}>
            <div className={styles.navItemContent}>
              <Briefcase size={18} />
              <span>My Applications</span>
            </div>
            <span className={styles.stage2Tag}>Stage 2</span>
          </div>
          <div className={styles.navItem} style={{ opacity: 0.65 }}>
            <div className={styles.navItemContent}>
              <Bookmark size={18} />
              <span>Saved Openings</span>
            </div>
            <span className={styles.stage2Tag}>Stage 2</span>
          </div>
        </>
      );
    }

    if (user.role === "recruiter") {
      return (
        <>
          <div className={styles.navHeading}>Menu</div>
          <NavLink
            to="/dashboard/recruiter"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <div className={styles.navItemContent}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </div>
          </NavLink>
          <NavLink
            to="/profile/recruiter"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <div className={styles.navItemContent}>
              <UserCheck size={18} />
              <span>Recruiter Profile</span>
            </div>
          </NavLink>

          <div className={styles.navHeading}>Stage 2 Features</div>
          <div className={styles.navItem} style={{ opacity: 0.65 }}>
            <div className={styles.navItemContent}>
              <PlusCircle size={18} />
              <span>Post New Job</span>
            </div>
            <span className={styles.stage2Tag}>Stage 2</span>
          </div>
          <div className={styles.navItem} style={{ opacity: 0.65 }}>
            <div className={styles.navItemContent}>
              <Search size={18} />
              <span>Candidate Search</span>
            </div>
            <span className={styles.stage2Tag}>Stage 2</span>
          </div>
        </>
      );
    }

    if (user.role === "employer") {
      return (
        <>
          <div className={styles.navHeading}>Menu</div>
          <NavLink
            to="/dashboard/employer"
            end
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <div className={styles.navItemContent}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </div>
          </NavLink>
          <NavLink
            to="/profile/employer"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <div className={styles.navItemContent}>
              <Building size={18} />
              <span>Company Profile</span>
            </div>
          </NavLink>

          <div className={styles.navHeading}>Stage 2 Features</div>
          <div className={styles.navItem} style={{ opacity: 0.65 }}>
            <div className={styles.navItemContent}>
              <Users size={18} />
              <span>Team & Recruiters</span>
            </div>
            <span className={styles.stage2Tag}>Stage 2</span>
          </div>
          <div className={styles.navItem} style={{ opacity: 0.65 }}>
            <div className={styles.navItemContent}>
              <BarChart3 size={18} />
              <span>Hiring Analytics</span>
            </div>
            <span className={styles.stage2Tag}>Stage 2</span>
          </div>
        </>
      );
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.brand}>
            <div className={styles.brandIcon}>
              <Briefcase size={18} />
            </div>
            <span>
              Talent<span className={styles.brandHighlight}>Forge</span>
            </span>
          </Link>
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Role Card */}
        {user && (
          <div className={styles.roleIndicator}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className={styles.roleAvatar}
              />
            ) : (
              <div className={styles.roleAvatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className={styles.roleDetails}>
              <span className={styles.roleUserName}>{user.name}</span>
              <span className={styles.roleBadge}>{user.role} workspace</span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className={styles.navSection}>{renderNavLinks()}</nav>

        {/* Footer with Logout */}
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutBtn}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className={styles.mainWrapper}>
        <header className={styles.topBar}>
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Sidebar"
          >
            <Menu size={22} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--slate-500)", fontWeight: 500 }}>
              TalentForge Workspace
            </span>
          </div>

          <div className={styles.topBarRight}>
            <Link to="/" className={styles.viewSiteLink}>
              <span>Public Portal</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        <main className={styles.contentContainer}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
