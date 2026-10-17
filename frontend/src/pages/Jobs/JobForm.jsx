import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  AlertCircle,
  Save,
  Send,
} from "lucide-react";
import { jobService } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import styles from "./JobForm.module.css";

const JobForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [workplaceType, setWorkplaceType] = useState("hybrid");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [period, setPeriod] = useState("yearly");
  const [minExp, setMinExp] = useState(0);
  const [maxExp, setMaxExp] = useState(5);
  const [vacancies, setVacancies] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [requiredEducation, setRequiredEducation] = useState("Bachelor's Degree");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("published");

  // Dynamic lists
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const [responsibilities, setResponsibilities] = useState([]);
  const [currentResp, setCurrentResp] = useState("");

  const [qualifications, setQualifications] = useState([]);
  const [currentQual, setCurrentQual] = useState("");

  // Load existing job if editing
  const loadJob = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await jobService.getJobById(id);
      if (res.data?.success && res.data.data?.job) {
        const j = res.data.data.job;
        setTitle(j.title || "");
        setEmploymentType(j.employmentType || "full-time");
        setWorkplaceType(j.workplaceType || "hybrid");
        setLocation(j.location || "");
        setMinSalary(j.salaryRange?.min !== undefined ? j.salaryRange.min : "");
        setMaxSalary(j.salaryRange?.max !== undefined ? j.salaryRange.max : "");
        setCurrency(j.salaryRange?.currency || "USD");
        setPeriod(j.salaryRange?.period || "yearly");
        setMinExp(j.experienceRange?.min ?? 0);
        setMaxExp(j.experienceRange?.max ?? 5);
        setVacancies(j.vacancies || 1);
        if (j.deadline) {
          setDeadline(new Date(j.deadline).toISOString().split("T")[0]);
        }
        setRequiredEducation(j.requiredEducation || "Bachelor's Degree");
        setDescription(j.description || "");
        setStatus(j.status || "published");
        setSkills(j.skills || []);
        setResponsibilities(j.responsibilities || []);
        setQualifications(j.qualifications || []);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  // Skill Add/Remove
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Responsibility Add/Remove
  const handleAddResp = (e) => {
    e.preventDefault();
    if (currentResp.trim()) {
      setResponsibilities([...responsibilities, currentResp.trim()]);
      setCurrentResp("");
    }
  };

  const handleRemoveResp = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  // Qualification Add/Remove
  const handleAddQual = (e) => {
    e.preventDefault();
    if (currentQual.trim()) {
      setQualifications([...qualifications, currentQual.trim()]);
      setCurrentQual("");
    }
  };

  const handleRemoveQual = (index) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, chosenStatus) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Job title is required");
      return;
    }
    if (!description.trim()) {
      setErrorMessage("Job description is required");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        employmentType,
        workplaceType,
        location: location.trim(),
        salaryRange: {
          min: minSalary !== "" ? Number(minSalary) : 0,
          max: maxSalary !== "" ? Number(maxSalary) : 0,
          currency,
          period,
        },
        experienceRange: {
          min: Number(minExp),
          max: Number(maxExp),
        },
        vacancies: Number(vacancies) || 1,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        requiredEducation,
        description: description.trim(),
        skills,
        responsibilities,
        qualifications,
        status: chosenStatus || status,
      };

      if (isEditing) {
        await jobService.updateJob(id, payload);
      } else {
        await jobService.createJob(payload);
      }

      const redirectPath =
        user?.role === "recruiter"
          ? "/dashboard/recruiter/jobs"
          : "/dashboard/employer/jobs";
      navigate(redirectPath);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to save job opening");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading job form...</p>
      </div>
    );
  }

  const backPath =
    user?.role === "recruiter"
      ? "/dashboard/recruiter/jobs"
      : "/dashboard/employer/jobs";

  return (
    <div className={styles.container}>
      <Link to={backPath} className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to my jobs</span>
      </Link>

      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h1 className={styles.title}>
            {isEditing ? "Edit Job Opening" : "Create New Job Opening"}
          </h1>
          <p className={styles.subtitle}>
            Fill in the details below to publish your opening to verified candidates.
          </p>
        </div>

        {errorMessage && (
          <div className={styles.alertError}>
            <AlertCircle size={18} style={{ display: "inline", marginRight: "0.5rem" }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, status)} className={styles.formGrid}>
          {/* Job Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Job Title *</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Senior Full Stack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Workplace & Employment Type */}
          <div className={styles.rowTwo}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Workplace Type *</label>
              <select
                className={styles.select}
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value)}
              >
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Employment Type *</label>
              <select
                className={styles.select}
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Location & Vacancies */}
          <div className={styles.rowTwo}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Location / City</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. San Francisco, CA (or Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Number of Vacancies</label>
              <input
                type="number"
                min="1"
                className={styles.input}
                value={vacancies}
                onChange={(e) => setVacancies(e.target.value)}
              />
            </div>
          </div>

          {/* Salary Range */}
          <div className={styles.rowThree}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Min Salary ($)</label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 100000"
                className={styles.input}
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Max Salary ($)</label>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 140000"
                className={styles.input}
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Period</label>
              <select
                className={styles.select}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="yearly">Per Year</option>
                <option value="monthly">Per Month</option>
                <option value="hourly">Per Hour</option>
              </select>
            </div>
          </div>

          {/* Experience Range & Deadline */}
          <div className={styles.rowThree}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Min Experience (Yrs)</label>
              <input
                type="number"
                min="0"
                max="25"
                className={styles.input}
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Max Experience (Yrs)</label>
              <input
                type="number"
                min="0"
                max="30"
                className={styles.input}
                value={maxExp}
                onChange={(e) => setMaxExp(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Application Deadline</label>
              <input
                type="date"
                className={styles.input}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Education */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Required Education</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Bachelor's Degree in CS or equivalent"
              value={requiredEducation}
              onChange={(e) => setRequiredEducation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Job Description *</label>
            <textarea
              className={styles.textarea}
              placeholder="Provide a comprehensive overview of the team, role impact, and day-to-day work..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Required Skills Builder */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Required Skills (Tags)</label>
            <div className={styles.listBuilder}>
              <div className={styles.addInputRow}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Type a skill (e.g. React, Node.js, AWS) and press Add"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={handleAddSkill}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              <div className={styles.itemChips}>
                {skills.map((skill) => (
                  <span key={skill} className={styles.itemChip}>
                    <span>{skill}</span>
                    <button
                      type="button"
                      className={styles.removeItemBtn}
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key Responsibilities Builder */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Key Responsibilities</label>
            <div className={styles.listBuilder}>
              <div className={styles.addInputRow}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Add a key responsibility..."
                  value={currentResp}
                  onChange={(e) => setCurrentResp(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddResp(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={handleAddResp}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              <ul className={styles.bulletListPreview}>
                {responsibilities.map((resp, i) => (
                  <li key={i} className={styles.bulletItemPreview}>
                    <span>• {resp}</span>
                    <button
                      type="button"
                      className={styles.removeItemBtn}
                      onClick={() => handleRemoveResp(i)}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Qualifications Builder */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Qualifications & Requirements</label>
            <div className={styles.listBuilder}>
              <div className={styles.addInputRow}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Add a required qualification..."
                  value={currentQual}
                  onChange={(e) => setCurrentQual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddQual(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={handleAddQual}
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>

              <ul className={styles.bulletListPreview}>
                {qualifications.map((qual, i) => (
                  <li key={i} className={styles.bulletItemPreview}>
                    <span>• {qual}</span>
                    <button
                      type="button"
                      className={styles.removeItemBtn}
                      onClick={() => handleRemoveQual(i)}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionsBar}>
            <Link to={backPath} className={styles.cancelBtn}>
              Cancel
            </Link>

            <button
              type="button"
              className={styles.saveDraftBtn}
              disabled={submitting}
              onClick={(e) => handleSubmit(e, "draft")}
            >
              <Save size={16} style={{ display: "inline", marginRight: "0.4rem" }} />
              <span>Save as Draft</span>
            </button>

            <button
              type="submit"
              className={styles.publishBtn}
              disabled={submitting}
              onClick={(e) => handleSubmit(e, "published")}
            >
              <Send size={16} style={{ display: "inline", marginRight: "0.4rem" }} />
              <span>{isEditing ? "Update & Publish" : "Publish Job Opening"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
