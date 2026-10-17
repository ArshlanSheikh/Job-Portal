import React, { useState, useEffect, useCallback } from "react";
import { Search, MapPin, UserCheck, Send, X, Sparkles } from "lucide-react";
import { candidateService, jobService, invitationService } from "../../services/api";
import styles from "./CandidateSearch.module.css";

const CandidateSearch = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Recruiter's company jobs for sending invitations
  const [myJobs, setMyJobs] = useState([]);

  // Modals state
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteModalCandidate, setInviteModalCandidate] = useState(null);
  const [inviteJobId, setInviteJobId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  // Load recruiter jobs
  useEffect(() => {
    jobService
      .getMyCompanyJobs({ status: "published", limit: 50 })
      .then((res) => {
        if (res.data?.success && res.data.data?.jobs) {
          setMyJobs(res.data.data.jobs);
          if (res.data.data.jobs.length > 0) {
            setInviteJobId(res.data.data.jobs[0]._id);
          }
        }
      })
      .catch((err) => console.error("Failed to load jobs for invite:", err));
  }, []);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (skillsFilter.trim()) params.skills = skillsFilter.trim();
      if (locationFilter.trim()) params.location = locationFilter.trim();

      const res = await candidateService.searchCandidates(params);
      if (res.data?.success) {
        setCandidates(res.data.data.candidates || []);
      }
    } catch (err) {
      console.error("Failed to search candidates:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, skillsFilter, locationFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleOpenInvite = (candidate) => {
    setInviteModalCandidate(candidate);
    setInviteMessage(`Hi ${candidate.fullName || "there"}, our team reviewed your profile and thinks your skills would make a great fit for our open position!`);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteJobId) {
      alert("Please select a job opening to invite the candidate to.");
      return;
    }

    try {
      setSendingInvite(true);
      const targetUserId =
        inviteModalCandidate.userId?._id || inviteModalCandidate.userId;

      await invitationService.sendInvitation({
        candidateId: targetUserId,
        jobId: inviteJobId,
        message: inviteMessage,
      });

      alert(`Invitation sent to ${inviteModalCandidate.fullName || "candidate"} successfully!`);
      setInviteModalCandidate(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Candidate Talent Discovery</h1>
        <p className={styles.subtitle}>
          Search and discover verified candidates, review technical skills, and send personalized job invitations.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className={styles.searchSection}>
        <div className={styles.searchInputWrapper}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, headline, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.searchInputWrapper}>
          <Sparkles size={18} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Skills (e.g. React, Node.js, Python)..."
            value={skillsFilter}
            onChange={(e) => setSkillsFilter(e.target.value)}
          />
        </div>

        <div className={styles.searchInputWrapper}>
          <MapPin size={18} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.searchBtn}>
          <Search size={16} />
          <span>Search Talent</span>
        </button>
      </form>

      {/* Candidates Grid */}
      {loading ? (
        <div className={styles.emptyState}>
          <p>Discovering candidates...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div className={styles.emptyState}>
          <UserCheck size={40} color="#94a3b8" style={{ marginBottom: "1rem" }} />
          <h2>No matching candidates found</h2>
          <p className={styles.subtitle}>
            Try broadening your search terms or clearing some of the filters.
          </p>
        </div>
      ) : (
        <div className={styles.candidatesGrid}>
          {candidates.map((cand) => (
            <div key={cand._id} className={styles.candidateCard}>
              <div className={styles.cardHeader}>
                {cand.profilePhoto ? (
                  <img
                    src={cand.profilePhoto}
                    alt={cand.fullName}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {cand.fullName ? cand.fullName.charAt(0).toUpperCase() : "C"}
                  </div>
                )}

                <div>
                  <h2 className={styles.candidateName}>
                    {cand.fullName || "Candidate"}
                  </h2>
                  <div className={styles.candidateHeadline}>
                    {cand.headline || "Professional"}
                  </div>
                  {cand.currentLocation && (
                    <div className={styles.locationRow}>
                      <MapPin size={13} />
                      <span>{cand.currentLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Chips */}
              {cand.skills && cand.skills.length > 0 && (
                <div className={styles.skillsContainer}>
                  {cand.skills.slice(0, 6).map((skill, index) => (
                    <span key={index} className={styles.skillChip}>
                      {skill}
                    </span>
                  ))}
                  {cand.skills.length > 6 && (
                    <span className={styles.skillChip}>
                      +{cand.skills.length - 6} more
                    </span>
                  )}
                </div>
              )}

              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.viewProfileBtn}
                  onClick={() => setSelectedCandidate(cand)}
                >
                  View Details
                </button>

                <button
                  type="button"
                  className={styles.inviteBtn}
                  onClick={() => handleOpenInvite(cand)}
                >
                  <Send size={14} />
                  <span>Invite to Apply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidate Profile View Modal */}
      {selectedCandidate && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedCandidate(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {selectedCandidate.fullName || "Candidate Profile"}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setSelectedCandidate(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {selectedCandidate.headline || "Candidate"}
                </h3>
                {selectedCandidate.currentLocation && (
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    <MapPin size={14} style={{ display: "inline", marginRight: "0.25rem" }} />
                    {selectedCandidate.currentLocation}
                  </div>
                )}
              </div>

              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Technical Skills & Tools
                  </h4>
                  <div className={styles.skillsContainer}>
                    {selectedCandidate.skills.map((skill, i) => (
                      <span key={i} className={styles.skillChip}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.experience && selectedCandidate.experience.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    Experience History
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {selectedCandidate.experience.map((exp, i) => (
                      <div
                        key={i}
                        style={{
                          background: "var(--bg-secondary)",
                          padding: "0.75rem 1rem",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{exp.title}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          {exp.company} • {exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate || "Past"}
                        </div>
                        {exp.description && (
                          <div style={{ fontSize: "0.88rem", marginTop: "0.35rem", color: "var(--text-secondary)" }}>
                            {exp.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.viewProfileBtn}
                onClick={() => setSelectedCandidate(null)}
              >
                Close
              </button>
              <button
                type="button"
                className={styles.inviteBtn}
                onClick={() => {
                  const c = selectedCandidate;
                  setSelectedCandidate(null);
                  handleOpenInvite(c);
                }}
              >
                <Send size={14} />
                <span>Invite Candidate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalCandidate && (
        <div
          className={styles.modalOverlay}
          onClick={() => setInviteModalCandidate(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Invite {inviteModalCandidate.fullName || "Candidate"} to Apply
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setInviteModalCandidate(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendInvite}>
              <div className={styles.modalBody}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Select Opening *
                  </label>
                  {myJobs.length === 0 ? (
                    <div style={{ color: "#dc2626", fontSize: "0.9rem" }}>
                      You have no active published jobs. Please publish a job opening first.
                    </div>
                  ) : (
                    <select
                      className={styles.selectInput}
                      value={inviteJobId}
                      onChange={(e) => setInviteJobId(e.target.value)}
                      required
                    >
                      {myJobs.map((j) => (
                        <option key={j._id} value={j._id}>
                          {j.title} ({j.workplaceType || "Onsite"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Personalized Message (Optional)
                  </label>
                  <textarea
                    className={styles.textarea}
                    placeholder="Add a personal note highlighting why this candidate matches the role..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.viewProfileBtn}
                  onClick={() => setInviteModalCandidate(null)}
                  disabled={sendingInvite}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.inviteBtn}
                  disabled={sendingInvite || myJobs.length === 0}
                >
                  {sendingInvite ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateSearch;
