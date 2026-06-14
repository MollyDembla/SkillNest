import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getInstructorCourses } from "../../services/instructorService";
import { deleteCourse, updateCourse } from "../../services/courseService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

const STATUS_CONFIG = {
  published: { bg: "#dcfce7", color: "#16a34a", label: "Published", icon: "✅" },
  draft: { bg: "#f3f4f6", color: "#6b7280", label: "Draft", icon: "📝" },
  pending: { bg: "#fef3c7", color: "#d97706", label: "Pending Review", icon: "⏳" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected", icon: "❌" },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "enrollments", label: "Most enrollments" },
  { value: "revenue", label: "Highest revenue" },
];

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 99,
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Rejection reason banner ───────────────────────────────────
function RejectionBanner({ reason }) {
  const [expanded, setExpanded] = useState(false);
  if (!reason) return null;
  const preview = reason.length > 80 ? reason.slice(0, 80) + "…" : reason;

  return (
    <div
      style={{
        background: "#fff5f5",
        border: "1px solid #fecaca",
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#dc2626", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Rejection reason
          </div>
          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
            {expanded ? reason : preview}
          </div>
          {reason.length > 80 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ background: "none", border: "none", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "4px 0 0", marginTop: 2 }}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────
function CourseCard({ course, onStatusChange, onDelete, actionLoading }) {
  const cfg = STATUS_CONFIG[course.status] || STATUS_CONFIG.draft;
  const busy = actionLoading === course._id;

  const levelLabel = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    all: "All levels",
  }[course.level] || course.level;

  const primaryAction = () => {
    if (course.status === "draft") {
      return (
        <button
          onClick={() => onStatusChange(course._id, "pending")}
          disabled={busy}
          style={{
            flex: 1,
            background: busy ? "#d1c4f7" : purple,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Submitting…" : "📤 Submit for Review"}
        </button>
      );
    }
    if (course.status === "pending") {
      return (
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 13,
            color: "#d97706",
            fontWeight: 700,
            padding: "8px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 16 }}>⏳</span> Under Admin Review
        </span>
      );
    }
    if (course.status === "published") {
      return (
        <Link
          to={`/courses/${course._id}`}
          style={{
            flex: 1,
            background: "#dcfce7",
            color: "#16a34a",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          👁️ View Course
        </Link>
      );
    }
    if (course.status === "rejected") {
      return (
        <button
          onClick={() => onStatusChange(course._id, "draft")}
          disabled={busy}
          style={{
            flex: 1,
            background: busy ? "#fecaca" : "#fee2e2",
            color: "#dc2626",
            border: "none",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? "Updating…" : "✏️ Move to Draft & Fix"}
        </button>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s, box-shadow 0.15s",
        border: course.status === "rejected" ? "1.5px solid #fecaca" : "1.5px solid transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.11)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", paddingTop: "52.5%", background: "#e9e4f7", flexShrink: 0 }}>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 44, color: "#c4b5e8",
            }}
          >
            📚
          </div>
        )}
        <span
          style={{
            position: "absolute", top: 10, left: 10,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
          }}
        >
          {cfg.icon} {cfg.label}
        </span>
        <span
          style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(0,0,0,0.6)", color: "#fff",
            fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 99,
          }}
        >
          {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Rejection reason (if applicable) */}
        {course.status === "rejected" && (
          <RejectionBanner reason={course.rejectionReason} />
        )}

        {/* Title */}
        <h3
          style={{
            margin: 0, fontSize: 15, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.35,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}
        >
          {course.title}
        </h3>

        {/* Category + Level */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {course.category && (
            <span style={{ fontSize: 11, fontWeight: 700, background: purpleLight, color: purple, padding: "3px 9px", borderRadius: 99 }}>
              {course.category}
            </span>
          )}
          {course.level && (
            <span style={{ fontSize: 11, fontWeight: 600, background: "#f3f4f6", color: "#6b7280", padding: "3px 9px", borderRadius: 99 }}>
              {levelLabel}
            </span>
          )}
        </div>

        {/* Rating */}
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {course.averageRating > 0 ? (
            <span>⭐ {course.averageRating.toFixed(1)} · {course.reviewsCount} review{course.reviewsCount !== 1 ? "s" : ""}</span>
          ) : (
            <span style={{ color: "#d1d5db" }}>No reviews yet</span>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
          <span style={{ color: "#374151", fontWeight: 600 }}>
            📖 {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "#374151", fontWeight: 600 }}>
            👥 {course.enrollmentCount} student{course.enrollmentCount !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "#16a34a", fontWeight: 700 }}>
            💰 ${course.revenue.toFixed(2)}
          </span>
        </div>

        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          Created {formatDate(course.createdAt)}
        </div>
      </div>

      {/* Action bar */}
      <div style={{ padding: "12px 18px", borderTop: "1px solid #f3f0fa", display: "flex", gap: 8, alignItems: "center" }}>
        {primaryAction()}

        <Link
          to={`/instructor/courses/${course._id}/edit`}
          title="Edit course"
          style={{
            background: purpleLight, color: purple,
            borderRadius: 10, padding: "8px 14px",
            fontSize: 13, fontWeight: 700, textDecoration: "none", flexShrink: 0,
          }}
        >
          ✏️
        </Link>

        <button
          onClick={() => onDelete(course._id, course.title)}
          title="Delete course"
          style={{
            background: "#fee2e2", color: "#dc2626",
            border: "none", borderRadius: 10,
            padding: "8px 12px", fontSize: 13,
            cursor: "pointer", flexShrink: 0,
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────
function DeleteModal({ target, onConfirm, onCancel, deleting }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff", borderRadius: 20, padding: "32px 28px",
          maxWidth: 420, width: "100%",
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 16 }}>🗑️</div>
        <h3 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: "#1a1a2e", textAlign: "center" }}>
          Delete Course?
        </h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 1.6 }}>
          <strong style={{ color: "#1a1a2e" }}>"{target.title}"</strong> will be permanently
          deleted. Students will lose access and this cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              flex: 1, background: "#f3f4f6", color: "#374151",
              border: "none", borderRadius: 12, padding: "12px",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              flex: 1, background: deleting ? "#fecaca" : "#dc2626",
              color: "#fff", border: "none", borderRadius: 12, padding: "12px",
              fontSize: 14, fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
const STATUS_TABS = ["all", "published", "draft", "pending", "rejected"];

export default function CourseManagePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;
      const res = await getInstructorCourses(params);
      setCourses(res.data.courses);
    } catch {
      toast.error("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, sort]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Tab counts (computed from ALL loaded courses for non-filtered view)
  const [allCourses, setAllCourses] = useState([]);
  useEffect(() => {
    if (statusFilter === "all" && !search) setAllCourses(courses);
  }, [courses, statusFilter, search]);

  const countForTab = (tab) => {
    if (tab === "all") return allCourses.length;
    return allCourses.filter((c) => c.status === tab).length;
  };

  const handleStatusChange = async (courseId, newStatus) => {
    setActionLoading(courseId);
    try {
      await updateCourse(courseId, { status: newStatus });
      const msg =
        newStatus === "pending"
          ? "Submitted for review! An admin will review your course."
          : "Course moved back to draft.";
      toast.success(msg);
      await loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCourse(deleteTarget.id);
      toast.success("Course deleted successfully.");
      setDeleteTarget(null);
      await loadCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  };

  const hasFilter = search || statusFilter !== "all";

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)` }}>
        <div
          style={{
            maxWidth: 1100, margin: "0 auto",
            padding: "36px 24px 50px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Link to="/instructor/dashboard" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                ← Dashboard
              </Link>
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff" }}>My Courses</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
              {allCourses.length > 0
                ? `${allCourses.length} course${allCourses.length !== 1 ? "s" : ""} total`
                : "Build, publish and grow your courses"}
            </p>
          </div>
          <Link
            to="/instructor/courses/create"
            style={{
              background: "#fff", color: purple,
              borderRadius: 12, padding: "11px 22px",
              fontWeight: 800, fontSize: 14, textDecoration: "none",
              flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
            }}
          >
            + Create Course
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "-26px auto 0", padding: "0 24px" }}>

        {/* ── Filter bar ── */}
        <div
          style={{
            background: "#fff", borderRadius: 16,
            padding: "16px 20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            marginBottom: 24,
          }}
        >
          {/* Top row: search + sort */}
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
              <span
                style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", fontSize: 14, color: "#9ca3af", pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by title…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px 9px 36px",
                  border: "1.5px solid #e9e4f7", borderRadius: 10,
                  fontSize: 14, color: "#1a1a2e", outline: "none",
                  boxSizing: "border-box", background: "#faf8ff",
                }}
              />
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: "9px 14px", border: "1.5px solid #e9e4f7",
                borderRadius: 10, fontSize: 13, fontWeight: 600,
                color: "#374151", background: "#faf8ff", cursor: "pointer",
                outline: "none", flexShrink: 0,
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Status tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_TABS.map((s) => {
              const active = statusFilter === s;
              const cfg = STATUS_CONFIG[s];
              const count = countForTab(s);
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    border: "none", borderRadius: 99,
                    padding: "7px 14px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    background: active ? purple : "#f3f0fa",
                    color: active ? "#fff" : "#6b7280",
                    display: "flex", alignItems: "center", gap: 5,
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {cfg?.icon || "📋"}
                  {s === "all" ? "All" : cfg?.label || s}
                  {count > 0 && (
                    <span
                      style={{
                        fontSize: 10, fontWeight: 800,
                        background: active ? "rgba(255,255,255,0.25)" : purpleLight,
                        color: active ? "#fff" : purple,
                        padding: "1px 6px", borderRadius: 99,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 14 }}>
            <div
              style={{
                width: 44, height: 44,
                border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`,
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "#9b8ec4", margin: 0, fontSize: 14 }}>Loading your courses…</p>
          </div>
        ) : courses.length === 0 ? (
          <div
            style={{
              background: "#fff", borderRadius: 20,
              padding: "64px 24px", textAlign: "center",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 56, marginBottom: 16 }}>
              {hasFilter ? "🔍" : "📭"}
            </div>
            <h3 style={{ color: "#1a1a2e", margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>
              {hasFilter ? "No courses match your filters" : "No courses yet"}
            </h3>
            <p style={{ color: "#6b7280", margin: "0 0 24px", fontSize: 14, lineHeight: 1.6 }}>
              {hasFilter
                ? "Try a different search term or status filter."
                : "Create your first course and start teaching on SkillNest."}
            </p>
            {hasFilter ? (
              <button
                onClick={() => { setSearchInput(""); setStatusFilter("all"); }}
                style={{
                  background: purpleLight, color: purple,
                  border: "none", borderRadius: 10,
                  padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/instructor/courses/create"
                style={{
                  background: `linear-gradient(135deg, #8b6ef5, ${purple})`,
                  color: "#fff", borderRadius: 12,
                  padding: "12px 28px", fontWeight: 800, fontSize: 14, textDecoration: "none",
                }}
              >
                Create Your First Course
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Result count */}
            <div style={{ fontSize: 13, color: "#9b8ec4", fontWeight: 600, marginBottom: 16 }}>
              Showing {courses.length} course{courses.length !== 1 ? "s" : ""}
              {hasFilter ? ` (filtered)` : ""}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 20,
              }}
            >
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onStatusChange={handleStatusChange}
                  onDelete={(id, title) => setDeleteTarget({ id, title })}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Delete modal ── */}
      {deleteTarget && (
        <DeleteModal
          target={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !deleting && setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
