import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building, MapPin, Users, ExternalLink, Search } from "lucide-react";
import { companyService } from "../../services/api";

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCompanies = async (query = "", showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await companyService.getAllCompanies({ search: query, limit: 30 });
      if (res.data && res.data.success) {
        setCompanies(res.data.data.companies || []);
      }
    } catch (err) {
      console.error("Failed to load companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    companyService
      .getAllCompanies({ search: "", limit: 30 })
      .then((res) => {
        if (isMounted && res.data && res.data.success) {
          setCompanies(res.data.data.companies || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load companies:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies(searchTerm);
  };

  return (
    <div style={{ padding: "3rem 0 5rem", backgroundColor: "var(--bg-page)", minHeight: "80vh" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 3rem" }}>
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--primary-600)",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Verified Employers
          </span>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--slate-900)", marginBottom: "0.75rem" }}>
            Explore Top Hiring Organizations
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--slate-600)" }}>
            Discover tech enterprises, innovative scale-ups, and startups actively recruiting talent.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "1.5rem",
              backgroundColor: "#ffffff",
              padding: "0.5rem",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, padding: "0 0.5rem" }}>
              <Search size={18} style={{ color: "var(--slate-400)" }} />
              <input
                type="text"
                placeholder="Search by company name, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.9375rem",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "var(--primary-600)",
                color: "#ffffff",
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
              }}
            >
              Search
            </button>
          </form>
        </div>

        {/* Company Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div className="spinner spinner-primary" style={{ width: "2.5rem", height: "2.5rem" }} />
            <p style={{ marginTop: "1rem", color: "var(--slate-500)" }}>Loading company directory...</p>
          </div>
        ) : companies.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {companies.map((comp) => (
              <div
                key={comp._id}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-xs)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all var(--transition-fast)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div
                    style={{
                      width: "3.25rem",
                      height: "3.25rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--slate-100)",
                      border: "1px solid var(--border-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "var(--primary-700)",
                      overflow: "hidden",
                    }}
                  >
                    {comp.logo ? (
                      <img
                        src={comp.logo}
                        alt={comp.companyName}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      comp.companyName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--slate-900)" }}>
                      {comp.companyName}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--primary-700)",
                        backgroundColor: "var(--primary-50)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        display: "inline-block",
                        marginTop: "0.25rem",
                      }}
                    >
                      {comp.industry || "General Industry"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--slate-600)",
                    marginBottom: "1rem",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Users size={15} style={{ color: "var(--slate-400)" }} />
                    <span>{comp.companySize || "11-50 employees"}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <MapPin size={15} style={{ color: "var(--slate-400)" }} />
                    <span>{comp.location || "Remote / Unspecified"}</span>
                  </span>
                </div>

                {comp.description && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--slate-600)",
                      lineHeight: 1.5,
                      marginBottom: "1rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {comp.description}
                  </p>
                )}

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--border-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {comp.website ? (
                    <a
                      href={comp.website.startsWith("http") ? comp.website : `https://${comp.website}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--primary-600)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <span>Visit Website</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ fontSize: "0.8125rem", color: "var(--slate-400)" }}>Verified Org</span>
                  )}
                  <Link
                    to={`/register?role=candidate`}
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--slate-700)",
                    }}
                  >
                    View Openings →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              backgroundColor: "#ffffff",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-light)",
            }}
          >
            <Building size={40} style={{ color: "var(--slate-300)", margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--slate-800)" }}>
              No companies match your search
            </h3>
            <p style={{ color: "var(--slate-500)", marginTop: "0.25rem" }}>
              Are you an employer? Register your company to list your organization on TalentForge.
            </p>
            <Link
              to="/register?role=employer"
              style={{
                display: "inline-block",
                marginTop: "1.25rem",
                padding: "0.625rem 1.5rem",
                backgroundColor: "var(--primary-600)",
                color: "#ffffff",
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
              }}
            >
              Register Employer Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesList;
