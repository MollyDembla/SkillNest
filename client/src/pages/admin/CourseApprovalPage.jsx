import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/apiClient";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

function RejectModal({ course, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ position: "relative", background: "#fff", borderRadius: 20, padding: "28px 28px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center",
            padding: 6, borderRadius: "50%", transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 style={{ margin: "0 0 6px", color: "#1a1a2e", fontSize: 18, fontWeight: 800 }}>Reject Course</h2>
        <p style={{ margin: "0 0 16px", color: "#6b7280", fontSize: 13 }}>
          "<strong style={{ color: "#1a1a2e" }}>{course.title}</strong>" will be rejected and the instructor notified.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this course is being rejected…"
          rows={4}
          style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e9e4f7", borderRadius: 12, fontSize: 13, resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "1.5px solid #e9e4f7", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || loading}
            style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: 14, cursor: !reason.trim() || loading ? "not-allowed" : "pointer", opacity: !reason.trim() || loading ? 0.7 : 1 }}
          >
            {loading ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseApprovalPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/courses", { params: { status: "pending", limit: 50 } });
      setCourses(res.data.data?.courses || []);
    } catch {
      toast.error("Failed to load pending courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (course) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/courses/${course._id}/approve`);
      setCourses((prev) => prev.filter((c) => c._id !== course._id));
      toast.success(`"${course.title}" approved and published!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await api.patch(`/admin/courses/${rejectTarget._id}/reject`, { reason });
      setCourses((prev) => prev.filter((c) => c._id !== rejectTarget._id));
      toast.success("Course rejected.");
      setRejectTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5ff", paddingBottom: 60 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)`, padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 6px" }}>
            <Link to="/admin/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Admin</Link> › Course Approvals
          </p>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: 0 }}>
            Course Approvals
            {courses.length > 0 && (
              <span style={{ marginLeft: 12, background: "#f59e0b", color: "#fff", fontSize: 14, fontWeight: 800, borderRadius: 99, padding: "2px 10px" }}>
                {courses.length}
              </span>
            )}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "6px 0 0" }}>Review and publish instructor-submitted courses.</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ width: 40, height: 40, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <p style={{ color: "#9ca3af", fontSize: 15, fontWeight: 600 }}>No pending courses</p>
            <p style={{ color: "#9ca3af", fontSize: 13 }}>All submissions have been reviewed.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {courses.map((course) => (
              <div key={course._id} style={{ background: "#fff", borderRadius: 20, padding: "20px 24px", boxShadow: "0 2px 12px rgba(95,73,153,0.07)", border: "1.5px solid #f0edf8", display: "flex", gap: 18, alignItems: "flex-start" }}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" style={{ width: 100, height: 70, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 100, height: 70, background: purpleLight, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, color: purple, fontWeight: 700 }}>No image</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, background: purpleLight, color: purple, borderRadius: 99, padding: "2px 10px", fontWeight: 700, textTransform: "capitalize" }}>{course.category}</span>
                    <span style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", borderRadius: 99, padding: "2px 10px", fontWeight: 700, textTransform: "capitalize" }}>{course.level}</span>
                    <span style={{ fontSize: 11, background: "#f3f4f6", color: "#374151", borderRadius: 99, padding: "2px 10px", fontWeight: 700 }}>{course.price === 0 ? "Free" : `$${course.price}`}</span>
                  </div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>{course.title}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
                    by {course.instructor?.name} · submitted {new Date(course.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  {course.subtitle && (
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280", lineHeight: 1.4 }}>{course.subtitle}</p>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                  <Link
                    to={`/courses/${course._id}`}
                    target="_blank"
                    style={{ fontSize: 12, color: purple, fontWeight: 700, textDecoration: "none", padding: "6px 14px", border: `1.5px solid ${purple}`, borderRadius: 10, textAlign: "center" }}
                  >
                    Preview
                  </Link>
                  <button
                    onClick={() => handleApprove(course)}
                    disabled={actionLoading}
                    style={{ padding: "8px 18px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.7 : 1 }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectTarget(course)}
                    disabled={actionLoading}
                    style={{ padding: "8px 18px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.7 : 1 }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rejectTarget && (
        <RejectModal
          course={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
