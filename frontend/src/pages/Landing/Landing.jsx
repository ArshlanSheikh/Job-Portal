import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Users,
  Compass,
} from "lucide-react";
import { jobService } from "../../services/api";
import styles from "./Landing.module.css";

const SAMPLE_FEATURED_JOBS = [
  {
    id: "job-1",
    company: "CloudScale Systems",
    logoText: "CS",
    title: "Senior Full-Stack Engineer",
    location: "San Francisco, CA (Hybrid)",
    salary: "$140,000 - $175,000",
    type: "Full-Time",
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "AWS"],
    postedDaysAgo: "2d ago",
  },
  {
    id: "job-2",
    company: "FinVantage AI",
    logoText: "FV",
    title: "Lead Frontend Architect",
    location: "New York, NY (Remote)",
    salary: "$155,000 - $190,000",
    type: "Full-Time",
    skills: ["React", "Next.js", "CSS Modules", "GraphQL", "Performance"],
    postedDaysAgo: "1d ago",
  },
  {
    id: "job-3",
    company: "Apex HealthTech",
    logoText: "AH",
    title: "Backend API Engineer",
    location: "Austin, TX (Remote)",
    salary: "$125,000 - $150,000",
    type: "Full-Time",
    skills: ["Node.js", "Express", "Microservices", "Docker", "PostgreSQL"],
    postedDaysAgo: "3d ago",
  },
  {
    id: "job-4",
    company: "Nova Commerce",
    logoText: "NC",
    title: "Product Designer & UI Specialist",
    location: "Seattle, WA (Hybrid)",
    salary: "$115,000 - $145,000",
    type: "Full-Time",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    postedDaysAgo: "4d ago",
  },
  {
    id: "job-5",
    company: "CyberShield Security",
    logoText: "CS",
    title: "DevOps & Cloud Infrastructure Lead",
    location: "Boston, MA (Remote)",
    salary: "$160,000 - $200,000",
    type: "Full-Time",
    skills: ["Kubernetes", "Terraform", "CI/CD", "AWS", "Linux"],
    postedDaysAgo: "Just now",
  },
  {
    id: "job-6",
    company: "DataMatrix Analytics",
    logoText: "DM",
    title: "Machine Learning Engineer",
    location: "Chicago, IL (Hybrid)",
    salary: "$150,000 - $185,000",
    type: "Full-Time",
    skills: ["Python", "PyTorch", "Data Pipelines", "FastAPI"],
    postedDaysAgo: "5d ago",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");
  const [liveJobs, setLiveJobs] = useState([]);

  useEffect(() => {
    jobService
      .getAllJobs({ limit: 6, status: "published" })
      .then((res) => {
        if (res.data?.success && res.data.data?.jobs?.length > 0) {
          setLiveJobs(res.data.data.jobs);
        }
      })
      .catch((err) => console.error("Failed to load featured jobs:", err));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm.trim()) query.set("search", searchTerm.trim());
    if (locationTerm.trim()) query.set("location", locationTerm.trim());
    navigate(`/jobs?${query.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroBadge}>
            <Sparkles size={16} />
            <span>Next-Generation Career & Talent Ecosystem</span>
          </div>

          <h1 className={styles.heroTitle}>
            Discover Career Milestones & Hire{" "}
            <span className={styles.heroTitleHighlight}>Top Talent</span>
          </h1>

          <p className={styles.heroSubtitle}>
            TalentForge bridges ambitious candidates with industry-leading recruiters
            and employers through modern profiles, transparent workflows, and real-time hiring.
          </p>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
              <div className={styles.searchField}>
                <Search size={20} className={styles.searchFieldIcon} />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.searchDivider} />

              <div className={styles.searchField}>
                <MapPin size={20} className={styles.searchFieldIcon} />
                <input
                  type="text"
                  placeholder="City, state, or 'Remote'..."
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <button type="submit" className={styles.searchBtn}>
                <Search size={18} />
                <span>Search Jobs</span>
              </button>
            </form>
          </div>

          {/* Popular Search Tags */}
          <div className={styles.popularTags}>
            <span>Popular searches:</span>
            {["React Developer", "Node.js", "Product Manager", "Remote", "DevOps"].map((tag) => (
              <button
                key={tag}
                type="button"
                className={styles.tagPill}
                onClick={() => navigate(`/jobs?search=${encodeURIComponent(tag)}`)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className={styles.featuredSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Curated Opportunities</span>
            <h2 className={styles.sectionTitle}>Featured Opportunities</h2>
            <p className={styles.sectionSubtitle}>
              Explore verified positions from innovative companies actively hiring through TalentForge.
            </p>
          </div>

          <div className={styles.jobGrid}>
            {liveJobs.length > 0
              ? liveJobs.map((job) => {
                  const company = job.company;
                  return (
                    <div
                      key={job._id}
                      className={styles.jobCard}
                      onClick={() => navigate(`/jobs/${job._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.jobCardTop}>
                        <div className={styles.companyLogo}>
                          {company?.logo ? (
                            <img
                              src={company.logo}
                              alt={company.companyName}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          ) : (
                            company?.companyName?.charAt(0).toUpperCase() || "C"
                          )}
                        </div>
                        <div className={styles.jobMeta}>
                          <span className={styles.companyName}>
                            {company?.companyName || "Organization"}
                          </span>
                          <h3 className={styles.jobTitle}>{job.title}</h3>
                        </div>
                      </div>

                      <div className={styles.jobDetails}>
                        <span className={styles.jobDetailItem}>
                          <MapPin size={15} />
                          {job.location || "Remote"}
                        </span>
                        {job.salaryRange && (job.salaryRange.min > 0 || job.salaryRange.max > 0) ? (
                          <span className={styles.jobDetailItem}>
                            <DollarSign size={15} />
                            ${job.salaryRange.min?.toLocaleString()} - ${job.salaryRange.max?.toLocaleString()}
                          </span>
                        ) : (
                          <span className={styles.jobDetailItem}>
                            <DollarSign size={15} />
                            Competitive
                          </span>
                        )}
                        <span className={styles.jobDetailItem} style={{ textTransform: "capitalize" }}>
                          <Briefcase size={15} />
                          {job.workplaceType || "Onsite"}
                        </span>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className={styles.skillPills}>
                          {job.skills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className={styles.skillBadge}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              : SAMPLE_FEATURED_JOBS.map((job) => (
                  <div
                    key={job.id}
                    className={styles.jobCard}
                    onClick={() => navigate(`/jobs?search=${encodeURIComponent(job.title)}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.jobCardTop}>
                      <div className={styles.companyLogo}>{job.logoText}</div>
                      <div className={styles.jobMeta}>
                        <span className={styles.companyName}>{job.company}</span>
                        <h3 className={styles.jobTitle}>{job.title}</h3>
                      </div>
                    </div>

                    <div className={styles.jobDetails}>
                      <span className={styles.jobDetailItem}>
                        <MapPin size={15} />
                        {job.location}
                      </span>
                      <span className={styles.jobDetailItem}>
                        <DollarSign size={15} />
                        {job.salary}
                      </span>
                      <span className={styles.jobDetailItem}>
                        <Briefcase size={15} />
                        {job.type}
                      </span>
                    </div>

                    <div className={styles.skillPills}>
                      {job.skills.map((skill) => (
                        <span key={skill} className={styles.skillBadge}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Why Choose TalentForge</span>
            <h2 className={styles.sectionTitle}>Built for Candidates & Employers</h2>
            <p className={styles.sectionSubtitle}>
              Streamlined workflows designed to empower every participant in modern recruitment.
            </p>
          </div>

          <div className={styles.benefitsGrid}>
            {/* For Candidates */}
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIconWrapper} ${styles.benefitIconCandidate}`}>
                <Compass size={28} />
              </div>
              <h3 className={styles.benefitTitle}>For Job Seekers & Candidates</h3>
              <p style={{ color: "var(--slate-600)", lineHeight: 1.6 }}>
                Build an impressive, multi-dimensional professional profile highlighting your skills,
                projects, certifications, and uploaded resume.
              </p>
              <ul className={styles.benefitList}>
                <li className={styles.benefitItem}>
                  <CheckCircle2 size={18} className={styles.benefitCheck} />
                  <span>Comprehensive profile builder with education, experience, and project showcases.</span>
                </li>
                <li className={styles.benefitItem}>
                  <CheckCircle2 size={18} className={styles.benefitCheck} />
                  <span>Resume upload supporting PDF, DOC, and DOCX formats.</span>
                </li>
                <li className={styles.benefitItem}>
                  <CheckCircle2 size={18} className={styles.benefitCheck} />
                  <span>Clear progress tracking and role preference configuration.</span>
                </li>
                <li className={styles.benefitItem}>
                  <CheckCircle2 size={18} className={styles.benefitCheck} />
                  <span>Instant visibility to top recruiters and hiring organizations.</span>
                </li>
              </ul>
              <div style={{ marginTop: "1rem" }}>
                <Link to="/register?role=candidate" className={styles.ctaBtnPrimary}>
                  <span>Create Candidate Profile</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* For Recruiters & Employers */}
            <div className={styles.benefitCard}>
              <div className={`${styles.benefitIconWrapper} ${styles.benefitIconEmployer}`}>
                <Users size={28} />
              </div>
              <h3 className={styles.benefitTitle}>For Recruiters & Companies</h3>
              <p style={{ color: "var(--slate-600)", lineHeight: 1.6 }}>
                Establish verified company presence, organize talent acquisition personnel,
                and discover pre-vetted candidates with specialized skillsets.
              </p>
              <ul className={styles.benefitList}>
                <li className={styles.benefitItem}>
                  <CheckCircle2 size={18} className={styles.benefitCheck} />
                  <span>Dedicated Employer portal to showcase corporate branding, culture, and size.</span>
                </li>
                <li className={styles.benefitItem}>
                  <CheckCircle2 size={18} className={styles.benefitCheck} />
                  <span>Recruiter profiles cleanly linked to corporate organizations.</span>
                </li>
                <li className={styles.benefitItem}>
                  <CheckCircle2 size={18} className={styles.benefitCheck} />
                  <span>Granular role-based permissions preventing unauthorized modifications.</span>
                </li>
                <li className={styles.benefitItem}>
                  <CheckCircle2 size={18} className={styles.benefitCheck} />
                  <span>Seamless pathway to Stage 2 candidate search and job post management.</span>
                </li>
              </ul>
              <div style={{ marginTop: "1rem" }}>
                <Link to="/register?role=employer" className={styles.ctaBtnPrimary}>
                  <span>Register Company Account</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.stepsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Simple Process</span>
            <h2 className={styles.sectionTitle}>How TalentForge Works</h2>
            <p className={styles.sectionSubtitle}>
              Three intuitive steps to advance your hiring or career trajectory.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Choose Your Role</h3>
              <p className={styles.stepDesc}>
                Sign up as a Candidate, Recruiter, or Employer with a dedicated tailored account and custom fields.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Build Your Profile</h3>
              <p className={styles.stepDesc}>
                Add skills, experience, company details, or upload your resume with our instant profile tools.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Connect & Elevate</h3>
              <p className={styles.stepDesc}>
                Access role-specific dashboards with curated metrics and prepare for upcoming hiring stages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Ready to Accelerate Your Recruitment Journey?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of professionals already building their careers and growing their teams with TalentForge.
          </p>
          <div className={styles.ctaActions}>
            <Link to="/register" className={styles.ctaBtnPrimary}>
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className={styles.ctaBtnSecondary}>
              <span>Existing Member? Sign In</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
