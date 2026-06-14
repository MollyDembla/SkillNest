import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getAdminCourses } from "../../services/adminService";
import { updateCourse, deleteCourse } from "../../services/courseService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

// ─── helpers ────────────────────────────────────────────────
const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Draft" },
  { key: "rejected", label: "Rejected" },
];

const STATUS_STYLE = {
  pending:   { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  published: { bg: "#dcfce7", color: "#166534", dot: "#16a34a" },
  draft:     { bg: "#f3f4f6", color: "#374151", dot: "#6b7280" },
  rejected:  { bg: "#fee2e2", color: "#991b1b", dot: "#dc2626" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.draft;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 99,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── reject modal ────────────────────────────────────────────
function RejectModal({ course, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 18, padding: "30px 28px",
          width: "100%", maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>✕</div>
        <h2 style={{ margin: "0 0 6px", color: "#1a1a2e", fontSize: 18, fontWeight: 800 }}>
          Reject Course
        </h2>
        <p style={{ margin: "0 0 18px", color: "#6b7280", fontSize: 13 }}>
          <strong style={{ color: "#1a1a2e" }}>"{course.title}"</strong> will be rejected and the instructor notified.
        </p>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          Reason for rejection
        </label>
        <textarea
          autoFocus
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this course doesn't meet platform guidelines…"
          style={{
            width: "100%", boxSizing: "border-box",
            border: "1.5px solid #e5e7eb", borderRadius: 10,
            padding: "10px 12px", fontSize: 13,
            resize: "vertical", outline: "none",
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "#f3f4f6", color: "#374151",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason || "Did not meet platform guidelines.")}
            disabled={loading}
            style={{
              flex: 1, background: "#dc2626", color: "#fff",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── delete modal ─────────────────────────────────────────────
function DeleteModal({ course, onConfirm, onClose, loading }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 18, padding: "30px 28px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>🗑️</div>
        <h2 style={{ margin: "0 0 6px", color: "#1a1a2e", fontSize: 18, fontWeight: 800 }}>
          Delete Course
        </h2>
        <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: 13 }}>
          Permanently delete <strong style={{ color: "#1a1a2e" }}>"{course.title}"</strong>? This cannot be undone and will remove all associated enrollments and lessons.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "#f3f4f6", color: "#374151",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, background: "#dc2626", color: "#fff",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── course row ───────────────────────────────────────────────
function CourseRow({ course, onApprove, onReject, onUnpublish, onDelete, actionId }) {
  const busy = actionId === course._id;
  return (
    <tr style={{ borderBottom: "1px solid #f3f0fa" }}>
      {/* Thumbnail + title */}
      <td style={{ padding: "14px 16px", minWidth: 280 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 52, height: 38, borderRadius: 8, overflow: "hidden",
              background: "#e9e4f7", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}
          >
            {course.thumbnail
              ? <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "📚"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700, color: "#1a1a2e", fontSize: 13,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: 220,
              }}
              title={course.title}
            >
              {course.title}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{course.category} · {course.level}</div>
          </div>
        </div>
      </td>

      {/* Instructor */}
      <td style={{ padding: "14px 12px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>
        <div style={{ fontWeight: 600 }}>{course.instructor?.name || "—"}</div>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>{course.instructor?.email}</div>
      </td>

      {/* Status */}
      <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
        <StatusBadge status={course.status} />
      </td>

      {/* Price */}
      <td style={{ padding: "14px 12px", fontSize: 13, fontWeight: 700, color: "#1a1a2e", whiteSpace: "nowrap" }}>
        ${course.price?.toFixed(2) ?? "0.00"}
      </td>

      {/* Date */}
      <td style={{ padding: "14px 12px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
        {new Date(course.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>

      {/* Actions */}
      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {course.status === "pending" && (
            <>
              <button
                onClick={() => onApprove(course._id)}
                disabled={busy}
                style={{
                  background: "#dcfce7", color: "#16a34a", border: "none",
                  borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700,
                  cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
                }}
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onReject(course)}
                disabled={busy}
                style={{
                  background: "#fee2e2", color: "#dc2626", border: "none",
                  borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700,
                  cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
                }}
              >
                ✕ Reject
              </button>
            </>
          )}

          {course.status === "published" && (
            <button
              onClick={() => onUnpublish(course._id)}
              disabled={busy}
              style={{
                background: "#fef3c7", color: "#92400e", border: "none",
                borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700,
                cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
              }}
            >
              ⊘ Unpublish
            </button>
          )}

          <Link
            to={`/courses/${course._id}`}
            target="_blank"
            style={{
              background: purpleLight, color: purple, textDecoration: "none",
              borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700,
            }}
          >
            View
          </Link>

          <button
            onClick={() => onDelete(course)}
            disabled={busy}
            style={{
              background: "#fee2e2", color: "#dc2626", border: "none",
              borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700,
              cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
            }}
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── main page ────────────────────────────────────────────────
export default function AdminCourseManagePage() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const debounceRef = useRef(null);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchCourses = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getAdminCourses({
          status: activeTab === "all" ? undefined : activeTab,
          search: debouncedSearch || undefined,
          page,
          limit: 15,
        });
        setCourses(res.data.courses);
        setPagination(res.data.pagination);
      } catch {
        toast.error("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, debouncedSearch]
  );

  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  const handleApprove = async (courseId) => {
    setActionId(courseId);
    try {
      await updateCourse(courseId, { status: "published" });
      toast.success("Course approved and published!");
      setCourses((prev) =>
        prev.map((c) => c._id === courseId ? { ...c, status: "published" } : c)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve.");
    } finally {
      setActionId(null);
    }
  };

  const handleUnpublish = async (courseId) => {
    setActionId(courseId);
    try {
      await updateCourse(courseId, { status: "draft" });
      toast.success("Course unpublished.");
      setCourses((prev) =>
        prev.map((c) => c._id === courseId ? { ...c, status: "draft" } : c)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unpublish.");
    } finally {
      setActionId(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    setModalLoading(true);
    try {
      await updateCourse(rejectTarget._id, { status: "rejected", rejectionReason: reason });
      toast.success("Course rejected.");
      setCourses((prev) =>
        prev.map((c) => c._id === rejectTarget._id ? { ...c, status: "rejected" } : c)
      );
      setRejectTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setModalLoading(true);
    try {
      await deleteCourse(deleteTarget._id);
      toast.success("Course deleted.");
      setCourses((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      setModalLoading(false);
    }
  };

  const pendingCount = courses.filter((c) => c.status === "pending").length;

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #1e1340 0%, ${purpleDark} 50%, ${purple} 100%)` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 48px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Link
                  to="/admin/dashboard"
                  style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}
                >
                  ← Dashboard
                </Link>
              </div>
              <h1 style={{ color: "#fff", margin: "8px 0 4px", fontSize: 24, fontWeight: 800 }}>
                Course Management
              </h1>
              <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 13 }}>
                {pagination.total} course{pagination.total !== 1 ? "s" : ""} on the platform
              </p>
            </div>
            {pendingCount > 0 && (
              <div style={{ background: "#fef3c7", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#92400e" }}>
                ⏳ {pendingCount} pending in current view
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px" }}>
        {/* Search + Filter card */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 20, overflow: "hidden" }}>
          {/* Search bar */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f0fa" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category…"
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid #e9e4f7", borderRadius: 10,
                padding: "10px 14px", fontSize: 14, outline: "none",
                background: "#faf8ff", color: "#1a1a2e",
              }}
            />
          </div>

          {/* Status tabs */}
          <div style={{ display: "flex", padding: "0 20px", gap: 2, overflowX: "auto" }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  borderBottom: activeTab === tab.key ? `3px solid ${purple}` : "3px solid transparent",
                  background: "none",
                  color: activeTab === tab.key ? purple : "#6b7280",
                  fontWeight: activeTab === tab.key ? 800 : 600,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "64px 24px", textAlign: "center" }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ width: 40, height: 40, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
              <p style={{ color: "#6b7280", margin: 0 }}>Loading courses…</p>
            </div>
          ) : courses.length === 0 ? (
            <div style={{ padding: "64px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
              <h3 style={{ color: "#1a1a2e", margin: "0 0 6px" }}>No courses found</h3>
              <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>
                {search ? "Try a different search term." : `No ${activeTab === "all" ? "" : activeTab + " "}courses yet.`}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#faf8ff", borderBottom: "2px solid #f3f0fa" }}>
                    {["Course", "Instructor", "Status", "Price", "Created", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px", textAlign: "left",
                          fontSize: 11, fontWeight: 800, color: "#6b7280",
                          textTransform: "uppercase", letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <CourseRow
                      key={course._id}
                      course={course}
                      onApprove={handleApprove}
                      onReject={setRejectTarget}
                      onUnpublish={handleUnpublish}
                      onDelete={setDeleteTarget}
                      actionId={actionId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f0fa", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Page {pagination.page} of {pagination.pages} · {pagination.total} courses
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => fetchCourses(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  style={{
                    background: pagination.page <= 1 ? "#f3f4f6" : purpleLight,
                    color: pagination.page <= 1 ? "#9ca3af" : purple,
                    border: "none", borderRadius: 8, padding: "8px 16px",
                    fontWeight: 700, fontSize: 13,
                    cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => fetchCourses(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  style={{
                    background: pagination.page >= pagination.pages ? "#f3f4f6" : purpleLight,
                    color: pagination.page >= pagination.pages ? "#9ca3af" : purple,
                    border: "none", borderRadius: 8, padding: "8px 16px",
                    fontWeight: 700, fontSize: 13,
                    cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {rejectTarget && (
        <RejectModal
          course={rejectTarget}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
          loading={modalLoading}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          course={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
          loading={modalLoading}
        />
      )}
    </div>
  );
}
