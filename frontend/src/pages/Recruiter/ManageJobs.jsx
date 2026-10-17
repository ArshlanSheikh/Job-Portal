import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Briefcase,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { jobService } from "../../services/api";
import styles from "./ManageJobs.module.css";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = activeTab !== "all" ? { status: activeTab } : {};
      const res = await jobService.getMyCompanyJobs(params);
      if (res.data?.success) {
        setJobs(res.data.data.jobs || []);
      }
    } catch (err) {
      console.error("Failed to load company jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleToggleStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === "published" ? "closed" : "published";
    try {
      await jobService.changeJobStatus(jobId, nextStatus);
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change job status");
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      await jobService.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete job");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return <span className={`${styles.statusBadge} ${styles.statusPublished}`}>Published</span>;
      case "draft":
        return <span className={`${styles.statusBadge} ${styles.statusDraft}`}>Draft</span>;
      case "closed":
        return <span className={`${styles.statusBadge} ${styles.statusClosed}`}>Closed</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Manage Job Openings</h1>
          <p className={styles.subtitle}>
            Create, publish, track applicants, and manage your organization's requisitions.
          </p>
        </div>

        <Link to="/jobs/create" className={styles.createBtn}>
          <Plus size={18} />
          <span>Post New Opening</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabsRow}>
        {[
          { id: "all", label: "All Openings" },
          { id: "published", label: "Published" },
          { id: "draft", label: "Drafts" },
          { id: "closed", label: "Closed" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === tab.id ? styles.tabBtnActive : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyState}>
            <p>Loading company openings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className={styles.emptyState}>
            <Briefcase size={40} color="#94a3b8" style={{ marginBottom: "1rem" }} />
            <h2 className={styles.emptyTitle}>No job openings found</h2>
            <p className={styles.emptySubtitle}>
              You don't have any {activeTab !== "all" ? activeTab : ""} requisitions yet.
            </p>
            <Link to="/jobs/create" className={styles.createBtn} style={{ margin: "0 auto" }}>
              <Plus size={16} />
              <span>Create your first job</span>
            </Link>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job Title & Details</th>
                <th>Status</th>
                <th>Workplace</th>
                <th>Applicants</th>
                <th>Posted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <Link to={`/jobs/${job._id}`} className={styles.jobTitleCell}>
                      {job.title}
                    </Link>
                    <div className={styles.jobMetaSub}>
                      {job.location || "Remote"} • {job.employmentType}
                    </div>
                  </td>

                  <td>{getStatusBadge(job.status)}</td>

                  <td>
                    <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                      {job.workplaceType}
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`/dashboard/recruiter/applications?jobId=${job._id}`}
                      className={styles.applicantsCountLink}
                    >
                      <Users size={15} />
                      <span>{job.applicantCount || 0} Candidates</span>
                    </Link>
                  </td>

                  <td>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </td>

                  <td>
                    <div className={styles.actionBtns}>
                      {/* View public page */}
                      <Link
                        to={`/jobs/${job._id}`}
                        className={styles.iconBtn}
                        title="View Public Details"
                      >
                        <Eye size={16} />
                      </Link>

                      {/* Edit */}
                      <Link
                        to={`/jobs/edit/${job._id}`}
                        className={styles.iconBtn}
                        title="Edit Job"
                      >
                        <Edit size={16} />
                      </Link>

                      {/* Toggle status */}
                      <button
                        type="button"
                        className={styles.iconBtn}
                        title={
                          job.status === "published"
                            ? "Close Requisition"
                            : "Publish Requisition"
                        }
                        onClick={() => handleToggleStatus(job._id, job.status)}
                      >
                        {job.status === "published" ? (
                          <XCircle size={16} color="#e11d48" />
                        ) : (
                          <CheckCircle size={16} color="#059669" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        title="Delete Opening"
                        onClick={() => handleDeleteJob(job._id, job.title)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
