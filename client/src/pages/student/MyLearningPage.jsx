import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyEnrollments } from "../../services/enrollmentService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";
const green = "#16a34a";
const greenLight = "#dcfce7";

// ─── helpers ────────────────────────────────────────────────
const FILTER_TABS = [
  { key: "all",         label: "All Courses" },
  { key: "in_progress", label: "In Progress" },
  { key: "not_started", label: "Not Started" },
  { key: "completed",   label: "Completed" },
];

const SORT_OPTIONS = [
  { key: "recent",   label: "Recently Enrolled" },
  { key: "progress", label: "Most Progress" },
  { key: "az",       label: "A → Z" },
];

function getCourseStatus(e) {
  if (e.status === "completed" || e.progressPercentage >= 100) return "completed";
  if (e.progressPercentage > 0) return "in_progress";
  return "not_started";
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── sub-components ──────────────────────────────────────────
function StatPill({ value, label }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flex: "1 1 0",
        minWidth: 130,
      }}
    >
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 3, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function ProgressBar({ value = 0 }) {
  const pct = Math.min(100, Math.max(0, value));
  const isComplete = pct >= 100;
  return (
    <div style={{ height: 6, borderRadius: 99, background: "#f3f0fa", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 99,
          background: isComplete
            ? `linear-gradient(90deg, #22c55e, ${green})`
            : `linear-gradient(90deg, #9c7ef5, ${purple})`,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function EnrollmentCard({ enrollment }) {
  const course = enrollment.course;
  const progress = enrollment.progressPercentage || 0;
  const status = getCourseStatus(enrollment);
  const isCompleted = status === "completed";
  const isNotStarted = status === "not_started";

  const ctaText = isCompleted ? "Review Course" : isNotStarted ? "Start Learning" : "Continue";
  const ctaBg = isCompleted
    ? greenLight
    : `linear-gradient(135deg, #8b6ef5, ${purple})`;
  const ctaColor = isCompleted ? green : "#fff";

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 20px rgba(95,73,153,0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(95,73,153,0.15)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(95,73,153,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", height: 158, background: "#e9e4f7", flexShrink: 0 }}>
        {course?.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#e9e4f7" }} />
        )}

        {/* Status badge */}
        {isCompleted && (
          <div
            style={{
              position: "absolute", top: 10, right: 10,
              background: green, color: "#fff",
              fontSize: 10, fontWeight: 800, padding: "3px 10px",
              borderRadius: 99, letterSpacing: "0.05em",
            }}
          >
            ✓ COMPLETED
          </div>
        )}
        {isNotStarted && (
          <div
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(0,0,0,0.5)", color: "#fff",
              fontSize: 10, fontWeight: 800, padding: "3px 10px",
              borderRadius: 99,
            }}
          >
            NEW
          </div>
        )}

        {/* Progress overlay strip at bottom of image */}
        {!isNotStarted && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "rgba(0,0,0,0.15)" }}>
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: isCompleted ? green : "#8b6ef5",
              }}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <Link
            to={`/courses/${course?._id}`}
            style={{ textDecoration: "none" }}
          >
            <h3
              style={{
                margin: 0, fontSize: 15, fontWeight: 800, color: purpleDark,
                lineHeight: 1.35,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {course?.title || "Untitled Course"}
            </h3>
          </Link>
          {course?.instructor?.name && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9b8ec4" }}>
              {course.instructor.name}
            </p>
          )}
        </div>

        {/* Progress row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "#6d658e", fontWeight: 600 }}>
              {isNotStarted ? "Not started yet" : `${progress}% complete`}
            </span>
            {!isNotStarted && (
              <span style={{ fontWeight: 800, color: isCompleted ? green : purple }}>
                {progress}%
              </span>
            )}
          </div>
          {!isNotStarted && <ProgressBar value={progress} />}
        </div>

        {/* Enrolled date */}
        <div style={{ fontSize: 11, color: "#b0a8cc" }}>
          Enrolled {timeAgo(enrollment.createdAt)}
        </div>

        {/* CTA */}
        <Link
          to={`/courses/${course?._id}`}
          style={{
            marginTop: "auto",
            display: "block",
            textAlign: "center",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
            background: ctaBg,
            color: ctaColor,
            boxShadow: isCompleted ? "none" : "0 6px 18px rgba(95,73,153,0.2)",
          }}
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────
export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortKey, setSortKey] = useState("recent");
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMyEnrollments()
      .then((res) => setEnrollments(res.data.enrollments || []))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load enrollments."))
      .finally(() => setLoading(false));
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter((e) => getCourseStatus(e) === "completed").length;
    const inProgress = enrollments.filter((e) => getCourseStatus(e) === "in_progress").length;
    const notStarted = enrollments.filter((e) => getCourseStatus(e) === "not_started").length;
    return { total, completed, inProgress, notStarted };
  }, [enrollments]);

  // Filtered + sorted list
  const visible = useMemo(() => {
    let list = enrollments;

    if (activeFilter !== "all") {
      list = list.filter((e) => getCourseStatus(e) === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.course?.title?.toLowerCase().includes(q) ||
          e.course?.instructor?.name?.toLowerCase().includes(q)
      );
    }

    if (sortKey === "progress") {
      list = [...list].sort((a, b) => b.progressPercentage - a.progressPercentage);
    } else if (sortKey === "az") {
      list = [...list].sort((a, b) =>
        (a.course?.title || "").localeCompare(b.course?.title || "")
      );
    }
    // "recent" is default sort from API (createdAt desc), no change needed

    return list;
  }, [enrollments, activeFilter, sortKey, search]);

  return (
    <div style={{ background: "#f7f1fb", minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`
        @media (max-width: 600px) {
          .my-learning-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
        }
        @media (max-width: 400px) {
          .my-learning-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(135deg, #1e1340 0%, ${purpleDark} 50%, ${purple} 100%)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 24px 52px" }}>
          <h1 style={{ color: "#fff", margin: "0 0 6px", fontSize: 28, fontWeight: 900 }}>
            My Learning
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", margin: "0 0 28px", fontSize: 14 }}>
            {loading ? "Loading your courses…" : `${stats.total} course${stats.total !== 1 ? "s" : ""} in your library`}
          </p>

          {/* Stats row */}
          {!loading && stats.total > 0 && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatPill value={stats.total}      label="Total Enrolled" />
              <StatPill value={stats.inProgress} label="In Progress" />
              <StatPill value={stats.completed}  label="Completed" />
              <StatPill value={stats.notStarted} label="Not Started" />
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "-20px auto 0", padding: "0 24px" }}>
        {/* ── Controls bar ── */}
        {!loading && !error && enrollments.length > 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              marginBottom: 24,
              overflow: "hidden",
            }}
          >
            {/* Search + sort */}
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #f3f0fa",
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your courses…"
                style={{
                  flex: 1,
                  minWidth: 180,
                  border: "1.5px solid #e9e4f7",
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 14,
                  outline: "none",
                  background: "#faf8ff",
                  color: "#1a1a2e",
                }}
              />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                style={{
                  border: "1.5px solid #e9e4f7",
                  borderRadius: 10,
                  padding: "9px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: purple,
                  background: purpleLight,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", padding: "0 18px", gap: 2, overflowX: "auto" }}>
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  style={{
                    padding: "11px 16px",
                    border: "none",
                    borderBottom: activeFilter === tab.key ? `3px solid ${purple}` : "3px solid transparent",
                    background: "none",
                    color: activeFilter === tab.key ? purple : "#6b7280",
                    fontWeight: activeFilter === tab.key ? 800 : 600,
                    fontSize: 13,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                  {tab.key === "in_progress" && stats.inProgress > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        background: purple,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 99,
                      }}
                    >
                      {stats.inProgress}
                    </span>
                  )}
                  {tab.key === "completed" && stats.completed > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        background: green,
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: 99,
                      }}
                    >
                      {stats.completed}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── States ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div
              style={{
                width: 44, height: 44,
                border: `4px solid ${purpleLight}`,
                borderTop: `4px solid ${purple}`,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 14px",
              }}
            />
            <p style={{ color: "#9b8ec4", fontSize: 14, margin: 0 }}>Loading your courses…</p>
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              borderRadius: 16,
              background: "#ffe2eb",
              padding: "20px 24px",
              color: "#c0284d",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {/* Empty library */}
        {!loading && !error && enrollments.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 4px 24px rgba(95,73,153,0.08)",
              padding: "72px 32px",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: purpleDark }}>
              Your library is empty
            </h2>
            <p style={{ margin: "0 auto 28px", maxWidth: 380, fontSize: 14, lineHeight: 1.8, color: "#6d658e" }}>
              You haven't enrolled in any courses yet. Browse the catalog and start learning today.
            </p>
            <Link
              to="/courses"
              style={{
                display: "inline-block",
                borderRadius: 999,
                padding: "13px 28px",
                fontSize: 14,
                fontWeight: 800,
                textDecoration: "none",
                color: "#fff",
                background: `linear-gradient(135deg, #8b6ef5, ${purple})`,
                boxShadow: "0 10px 24px rgba(95,73,153,0.25)",
              }}
            >
              Browse Courses
            </Link>
          </div>
        )}

        {/* Empty filtered result */}
        {!loading && !error && enrollments.length > 0 && visible.length === 0 && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: "0 0 6px", color: purpleDark, fontSize: 18, fontWeight: 800 }}>
              No courses match
            </h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
              {search ? `No results for "${search}". Try a different search.` : `No ${activeFilter.replace("_", " ")} courses.`}
            </p>
            <button
              onClick={() => { setSearch(""); setActiveFilter("all"); }}
              style={{
                marginTop: 16,
                background: purpleLight, color: purple,
                border: "none", borderRadius: 10,
                padding: "9px 20px", fontWeight: 700, fontSize: 13,
                cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ── Course grid ── */}
        {!loading && !error && visible.length > 0 && (
          <>
            <div
              className="my-learning-grid"
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              }}
            >
              {visible.map((enrollment) => (
                <EnrollmentCard key={enrollment._id} enrollment={enrollment} />
              ))}
            </div>

            <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#9b8ec4" }}>
              Showing {visible.length} of {enrollments.length} course{enrollments.length !== 1 ? "s" : ""}
            </p>
          </>
        )}

        {/* Browse more CTA */}
        {!loading && !error && enrollments.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link
              to="/courses"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: purple,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
                background: purpleLight,
                padding: "11px 22px",
                borderRadius: 12,
              }}
            >
              Browse more courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
