import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Filter,
  X,
  Building,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { jobService, savedJobService } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import styles from "./JobsList.module.css";

const JobsList = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search and Filter states initialized from URL query params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [workplaceType, setWorkplaceType] = useState(
    searchParams.get("workplaceType") ? searchParams.get("workplaceType").split(",") : []
  );
  const [employmentType, setEmploymentType] = useState(
    searchParams.get("employmentType") ? searchParams.get("employmentType").split(",") : []
  );
  const [minSalary, setMinSalary] = useState(searchParams.get("minSalary") || "");
  const [minExp, setMinExp] = useState(searchParams.get("minExp") || "");
  const [maxExp, setMaxExp] = useState(searchParams.get("maxExp") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Fetch saved jobs for logged in candidates
  useEffect(() => {
    if (isAuthenticated && user?.role === "candidate") {
      savedJobService
        .getMySavedJobs({ limit: 100 })
        .then((res) => {
          if (res.data?.success && res.data?.data?.savedJobs) {
            const ids = new Set(
              res.data.data.savedJobs.map((item) => item.jobId?._id).filter(Boolean)
            );
            setSavedJobIds(ids);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user]);

  // Fetch Jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (location.trim()) params.location = location.trim();
      if (workplaceType.length > 0) params.workplaceType = workplaceType.join(",");
      if (employmentType.length > 0) params.employmentType = employmentType.join(",");
      if (minSalary) params.minSalary = minSalary;
      if (minExp) params.minExperience = minExp;
      if (maxExp) params.maxExperience = maxExp;

      const res = await jobService.getAllJobs(params);
      if (res.data?.success) {
        setJobs(res.data.data.jobs || []);
        setTotal(res.data.data.total || 0);
        setTotalPages(res.data.data.pages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [search, location, workplaceType, employmentType, minSalary, minExp, maxExp, sort, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Sync state to URL params
  const updateUrlParams = () => {
    const nextParams = {};
    if (search.trim()) nextParams.search = search.trim();
    if (location.trim()) nextParams.location = location.trim();
    if (workplaceType.length > 0) nextParams.workplaceType = workplaceType.join(",");
    if (employmentType.length > 0) nextParams.employmentType = employmentType.join(",");
    if (minSalary) nextParams.minSalary = minSalary;
    if (minExp) nextParams.minExp = minExp;
    if (maxExp) nextParams.maxExp = maxExp;
    if (sort !== "newest") nextParams.sort = sort;
    if (page > 1) nextParams.page = page;

    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateUrlParams();
    fetchJobs();
  };

  const handleToggleWorkplace = (type) => {
    setWorkplaceType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  const handleToggleEmployment = (type) => {
    setEmploymentType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setWorkplaceType([]);
    setEmploymentType([]);
    setMinSalary("");
    setMinExp("");
    setMaxExp("");
    setSort("newest");
    setPage(1);
    setSearchParams({});
  };

  const handleToggleSave = async (jobId) => {
    if (!isAuthenticated) {
      alert("Please login as a candidate to save jobs.");
      return;
    }
    if (user?.role !== "candidate") {
      alert("Only candidates can save jobs.");
      return;
    }

    const isCurrentlySaved = savedJobIds.has(jobId);
    try {
      if (isCurrentlySaved) {
        await savedJobService.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await savedJobService.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error("Failed to toggle save job:", err);
    }
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange || (!salaryRange.min && !salaryRange.max)) return null;
    const { min, max, currency = "USD", period = "yearly" } = salaryRange;
    const symbol = currency === "USD" ? "$" : currency;
    const periodLabel = period === "yearly" ? "/yr" : "/mo";

    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()} ${periodLabel}`;
    }
    if (min) return `From ${symbol}${min.toLocaleString()} ${periodLabel}`;
    return `Up to ${symbol}${max.toLocaleString()} ${periodLabel}`;
  };

  const hasActiveFilters =
    search ||
    location ||
    workplaceType.length > 0 ||
    employmentType.length > 0 ||
    minSalary ||
    minExp ||
    maxExp;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Explore Career Opportunities</h1>
        <p className={styles.subtitle}>
          Discover verified roles from top tech companies and innovative startups.
        </p>
      </div>

      {/* Keyword & Location Search Bar */}
      <form onSubmit={handleSearchSubmit} className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Job title, skill, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.searchInputWrapper}>
          <MapPin size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="City, state, or remote..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.searchBtn}>
          <Search size={18} />
          <span>Search Jobs</span>
        </button>
      </form>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className={styles.layoutGrid}>
        {/* Filters Sidebar */}
        <aside className={styles.filterSidebar}>
          <div className={styles.filterHeader}>
            <div className={styles.filterTitle}>
              <Filter size={18} />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clearFiltersBtn}
                onClick={handleClearFilters}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Workplace Type */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Workplace Type</label>
            <div className={styles.filterOptions}>
              {[
                { id: "remote", label: "Remote" },
                { id: "hybrid", label: "Hybrid" },
                { id: "onsite", label: "On-site" },
              ].map((item) => (
                <label key={item.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={workplaceType.includes(item.id)}
                    onChange={() => handleToggleWorkplace(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employment Type */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Employment Type</label>
            <div className={styles.filterOptions}>
              {[
                { id: "full-time", label: "Full-time" },
                { id: "part-time", label: "Part-time" },
                { id: "contract", label: "Contract" },
                { id: "internship", label: "Internship" },
              ].map((item) => (
                <label key={item.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={employmentType.includes(item.id)}
                    onChange={() => handleToggleEmployment(item.id)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Range */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Experience (Years)</label>
            <div className={styles.rangeInputs}>
              <input
                type="number"
                placeholder="Min"
                min="0"
                max="30"
                className={styles.rangeInput}
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                max="30"
                className={styles.rangeInput}
                value={maxExp}
                onChange={(e) => setMaxExp(e.target.value)}
              />
            </div>
          </div>

          {/* Minimum Salary */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Min Annual Salary ($)</label>
            <input
              type="number"
              placeholder="e.g. 80000"
              step="5000"
              className={styles.filterInput}
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
            />
          </div>
        </aside>

        {/* Results Area */}
        <main>
          <div className={styles.resultsHeader}>
            <div className={styles.resultsCount}>
              Showing <strong>{jobs.length}</strong> of <strong>{total}</strong> open positions
            </div>

            <div className={styles.sortSelectWrapper}>
              <label htmlFor="sortJobs">Sort by:</label>
              <select
                id="sortJobs"
                className={styles.sortSelect}
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Most Recent</option>
                <option value="salary_high">Highest Salary</option>
                <option value="deadline">Approaching Deadline</option>
              </select>
            </div>
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className={styles.activeFilters}>
              {search && (
                <span className={styles.activeFilterBadge}>
                  Keyword: {search}
                  <button
                    type="button"
                    className={styles.removeFilterBtn}
                    onClick={() => setSearch("")}
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {location && (
                <span className={styles.activeFilterBadge}>
                  Location: {location}
                  <button
                    type="button"
                    className={styles.removeFilterBtn}
                    onClick={() => setLocation("")}
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {workplaceType.map((t) => (
                <span key={t} className={styles.activeFilterBadge}>
                  {t}
                  <button
                    type="button"
                    className={styles.removeFilterBtn}
                    onClick={() => handleToggleWorkplace(t)}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {employmentType.map((t) => (
                <span key={t} className={styles.activeFilterBadge}>
                  {t}
                  <button
                    type="button"
                    className={styles.removeFilterBtn}
                    onClick={() => handleToggleEmployment(t)}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              {minSalary && (
                <span className={styles.activeFilterBadge}>
                  Min ${Number(minSalary).toLocaleString()}
                  <button
                    type="button"
                    className={styles.removeFilterBtn}
                    onClick={() => setMinSalary("")}
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Job Cards */}
          {loading ? (
            <div className={styles.emptyState}>
              <p>Loading openings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className={styles.emptyState}>
              <Briefcase size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No matching positions found</h2>
              <p className={styles.emptyText}>
                We could not find any openings matching your criteria. Try adjusting your
                keywords or clearing some filters.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.searchBtn}
                  onClick={handleClearFilters}
                  style={{ margin: "0 auto" }}
                >
                  Reset all filters
                </button>
              )}
            </div>
          ) : (
            <div className={styles.jobList}>
              {jobs.map((job) => {
                const isSaved = savedJobIds.has(job._id);
                const salaryText = formatSalary(job.salaryRange);

                return (
                  <article key={job._id} className={styles.jobCard}>
                    <div className={styles.jobCardHeader}>
                      <div className={styles.companyLogoWrapper}>
                        {job.company?.logo ? (
                          <img
                            src={job.company.logo}
                            alt={job.company.companyName}
                            className={styles.companyLogo}
                          />
                        ) : (
                          <Building size={24} color="#94a3b8" />
                        )}
                      </div>

                      <div className={styles.jobInfo}>
                        <Link to={`/jobs/${job._id}`} className={styles.jobTitle}>
                          {job.title}
                        </Link>
                        <div className={styles.companyName}>
                          {job.company?.companyName || "Confidential Organization"}
                        </div>
                      </div>

                      {user?.role === "candidate" && (
                        <button
                          type="button"
                          className={`${styles.saveBtn} ${
                            isSaved ? styles.saveBtnActive : ""
                          }`}
                          onClick={() => handleToggleSave(job._id)}
                          title={isSaved ? "Unsave opening" : "Save opening"}
                        >
                          <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                      )}
                    </div>

                    {/* Meta Badges */}
                    <div className={styles.badgeRow}>
                      <span className={`${styles.badge} ${styles.badgeWorkplace}`}>
                        <Sparkles size={13} />
                        {job.workplaceType ? job.workplaceType.toUpperCase() : "ONSITE"}
                      </span>
                      <span className={`${styles.badge} ${styles.badgeEmployment}`}>
                        <Briefcase size={13} />
                        {job.employmentType}
                      </span>
                      {job.location && (
                        <span className={`${styles.badge} ${styles.badgeLocation}`}>
                          <MapPin size={13} />
                          {job.location}
                        </span>
                      )}
                      {salaryText && (
                        <span className={`${styles.badge} ${styles.badgeSalary}`}>
                          <DollarSign size={13} />
                          {salaryText}
                        </span>
                      )}
                      {job.experienceRange?.min !== undefined && (
                        <span className={`${styles.badge} ${styles.badgeExp}`}>
                          {job.experienceRange.min} - {job.experienceRange.max || "+"} yrs exp
                        </span>
                      )}
                    </div>

                    {/* Skills pills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className={styles.skillsList}>
                        {job.skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className={styles.skillPill}>
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className={styles.skillPill}>
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className={styles.jobCardFooter}>
                      <div>
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                        {job.deadline && (
                          <span>
                            {" "}
                            • Apply by {new Date(job.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <Link to={`/jobs/${job._id}`} className={styles.applyLink}>
                        <span>View Details</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`${styles.pageBtn} ${
                    p === page ? styles.pageBtnActive : ""
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobsList;
