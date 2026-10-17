import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Building,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { invitationService } from "../../services/api";
import styles from "./InvitationsList.module.css";

const InvitationsList = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const res = await invitationService.getMyInvitations();
      if (res.data?.success) {
        setInvitations(res.data.data.invitations || []);
      }
    } catch (err) {
      console.error("Failed to load invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleRespond = async (invitationId, action) => {
    try {
      await invitationService.respondToInvitation(invitationId, action);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv._id === invitationId
            ? { ...inv, status: action === "accept" ? "accepted" : "declined" }
            : inv
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to respond to invitation");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending Response</span>;
      case "accepted":
        return <span className={`${styles.statusBadge} ${styles.statusAccepted}`}>Accepted</span>;
      case "declined":
        return <span className={`${styles.statusBadge} ${styles.statusDeclined}`}>Declined</span>;
      case "cancelled":
        return <span className={`${styles.statusBadge} ${styles.statusCancelled}`}>Cancelled</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Direct Recruiter Invitations</h1>
        <p className={styles.subtitle}>
          Review personalized invitations sent to you by verified recruiters and companies.
        </p>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <p>Loading invitations...</p>
        </div>
      ) : invitations.length === 0 ? (
        <div className={styles.emptyState}>
          <Mail size={40} color="#94a3b8" style={{ marginBottom: "1rem" }} />
          <h2>No invitations received yet</h2>
          <p className={styles.subtitle}>
            When recruiters discover your profile and invite you to apply for their openings, they will appear right here.
          </p>
        </div>
      ) : (
        <div className={styles.invitesList}>
          {invitations.map((inv) => {
            const job = inv.jobId;
            const company = inv.companyId;
            const recruiter = inv.recruiterId;

            return (
              <article key={inv._id} className={styles.inviteCard}>
                <div className={styles.cardTop}>
                  <div className={styles.companySection}>
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt={company.companyName}
                        className={styles.companyLogo}
                      />
                    ) : (
                      <div
                        className={styles.companyLogo}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Building size={20} color="#94a3b8" />
                      </div>
                    )}

                    <div>
                      {job ? (
                        <Link to={`/jobs/${job._id}`} className={styles.jobTitle}>
                          {job.title}
                        </Link>
                      ) : (
                        <div className={styles.jobTitle}>Position Requisition</div>
                      )}
                      <div className={styles.companyName}>
                        {company?.companyName || "Organization"} • Sent by {recruiter?.name || "Recruiter"}
                      </div>
                    </div>
                  </div>

                  <div>{getStatusBadge(inv.status)}</div>
                </div>

                {/* Personalized Message */}
                {inv.message && (
                  <div className={styles.messageBox}>
                    <div className={styles.messageAuthor}>
                      Personal Message from {recruiter?.name || "the hiring team"}:
                    </div>
                    <div>"{inv.message}"</div>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Received on {new Date(inv.createdAt).toLocaleDateString()}
                  </div>

                  <div className={styles.actionBtns}>
                    {inv.status === "pending" && (
                      <>
                        <button
                          type="button"
                          className={styles.declineBtn}
                          onClick={() => handleRespond(inv._id, "decline")}
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          className={styles.acceptBtn}
                          onClick={() => handleRespond(inv._id, "accept")}
                        >
                          <Check size={16} />
                          <span>Accept Invitation</span>
                        </button>
                      </>
                    )}

                    {inv.status === "accepted" && job && (
                      <Link to={`/jobs/${job._id}`} className={styles.viewJobLink}>
                        <span>Apply for this Position</span>
                        <ArrowRight size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvitationsList;
