import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/adminService";
import { updateCourse } from "../../services/courseService";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmt(n) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n || 0);
}

function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8e8e8",
      borderTop: `3px solid ${accent}`,
      borderRadius: 4,
      padding: "20px 22px",
      flex: "1 1 0",
      minWidth: 160,
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#1c1d1f", lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#6a6f73", marginTop: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

function BreakdownRow({ label, count, total, accent }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#1c1d1f", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1c1d1f" }}>
          {fmt(count)} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ background: "#f7f9fa", borderRadius: 2, height: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: accent, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function RevenueChart({ data }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const match = data.find((r) => r.date === key);
    days.push({ key, label: d.toLocaleDateString("en-US", { weekday: "short" }), amount: match?.amount || 0 });
  }
  const max = Math.max(...days.map((d) => d.amount), 1);

  return (
    <div>
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80, padding: "0 2px" }}>
        {days.map((day) => {
          const barH = Math.max((day.amount / max) * 64, day.amount > 0 ? 4 : 0);
          return (
            <div key={day.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
              {day.amount > 0 && (
                <div style={{ fontSize: 10, color: "#5f4999", fontWeight: 700 }}>${day.amount.toFixed(0)}</div>
              )}
              <div style={{ width: "100%", height: barH, background: day.amount > 0 ? "#5f4999" : "#e8e8e8", borderRadius: "2px 2px 0 0" }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 4, padding: "6px 2px 0", borderTop: "1px solid #e8e8e8" }}>
        {days.map((day) => (
          <div key={day.key} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
            {day.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingCourseCard({ course, onApprove, onReject, approving, rejecting }) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: 80, background: "#ede9f8", position: "relative", overflow: "hidden" }}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #ede9f8, #d8c4ff)" }} />
        )}
        <span style={{
          position: "absolute", top: 6, right: 6,
          background: "rgba(0,0,0,0.55)", color: "#fff",
          fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 2,
        }}>
          ${course.price?.toFixed(2) || "0.00"}
        </span>
      </div>

      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 700, color: "#1c1d1f", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
          {course.title}
        </div>
        <div style={{ fontSize: 11, color: "#6a6f73", marginBottom: 10 }}>
          {course.instructor?.name} · {course.category}
        </div>

        {!showRejectInput ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => onApprove(course._id)}
              disabled={approving}
              style={{ flex: 1, background: approving ? "#bbf7d0" : "#dcfce7", color: "#16a34a", border: "none", borderRadius: 4, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: approving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {approving ? "…" : "Approve"}
            </button>
            <button
              onClick={() => setShowRejectInput(true)}
              style={{ flex: 1, background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 4, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
            >
              Reject
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection"
              style={{ padding: "6px 10px", border: "1.5px solid #fca5a5", borderRadius: 4, fontSize: 12, outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setShowRejectInput(false)}
                style={{ flex: 1, background: "#f7f9fa", color: "#1c1d1f", border: "1px solid #e8e8e8", borderRadius: 4, padding: "6px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={() => onReject(course._id, reason)}
                disabled={rejecting}
                style={{ flex: 1, background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, padding: "6px 0", fontSize: 12, fontWeight: 700, cursor: rejecting ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {rejecting ? "…" : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const load = () => {
    setLoading(true);
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load admin dashboard."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (courseId) => {
    setApprovingId(courseId);
    try {
      await updateCourse(courseId, { status: "published" });
      toast.success("Course approved and published.");
      setData((prev) => ({
        ...prev,
        pendingCourses: prev.pendingCourses.filter((c) => c._id !== courseId),
        stats: { ...prev.stats, pendingCourses: prev.stats.pendingCourses - 1, publishedCourses: prev.stats.publishedCourses + 1 },
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (courseId, reason) => {
    setRejectingId(courseId);
    try {
      await updateCourse(courseId, { status: "rejected", rejectionReason: reason || "Did not meet platform guidelines." });
      toast.success("Course rejected.");
      setData((prev) => ({
        ...prev,
        pendingCourses: prev.pendingCourses.filter((c) => c._id !== courseId),
        stats: { ...prev.stats, pendingCourses: prev.stats.pendingCourses - 1, rejectedCourses: (prev.stats.rejectedCourses || 0) + 1 },
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject.");
    } finally {
      setRejectingId(null);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "Admin";

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 28, height: 28, border: "2px solid #e8e8e8", borderTopColor: "#5f4999", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <p style={{ color: "#1c1d1f", fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>Something went wrong</p>
        <p style={{ color: "#6a6f73", margin: "0 0 20px" }}>{error}</p>
        <button onClick={load} style={{ background: "#5f4999", color: "#fff", border: "none", borderRadius: 4, padding: "10px 24px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
          Retry
        </button>
      </div>
    );
  }

  const { stats, pendingCourses, recentUsers, revenueByDay } = data;

  return (
    <div style={{ background: "#f7f9fa", minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #3c3168 0%, #5f4999 100%)", padding: "36px 24px 48px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "rgba(255,255,255,0.65)", margin: "6px 0 0", fontSize: 14 }}>
              Welcome back, {firstName} — {fmt(stats.totalUsers)} users · {fmt(stats.totalCourses)} courses
            </p>
          </div>
          {stats.pendingCourses > 0 && (
            <div style={{ background: "#fef3c7", borderRadius: 4, padding: "10px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
                {stats.pendingCourses} course{stats.pendingCourses !== 1 ? "s" : ""} awaiting review
              </div>
              <div style={{ fontSize: 11, color: "#b45309", marginTop: 2 }}>Scroll down to approve or reject</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "-24px auto 0", padding: "0 24px" }}>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <StatCard label="Total Users" value={fmt(stats.totalUsers)} accent="#5f4999" sub={`${fmt(stats.students)} students · ${fmt(stats.instructors)} instructors`} />
          <StatCard label="Total Courses" value={fmt(stats.totalCourses)} accent="#0ea5e9" sub={`${fmt(stats.publishedCourses)} published`} />
          <StatCard label="Enrollments" value={fmt(stats.totalEnrollments)} accent="#16a34a" />
          <StatCard label="Total Revenue" value={`$${fmt(stats.totalRevenue)}`} accent="#f97316" sub={`$${fmt(stats.revenueThisMonth)} this month`} />
        </div>

        {/* Middle row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 16 }}>

          {/* Pending Approvals */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1c1d1f", letterSpacing: "-0.01em" }}>Pending Approvals</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6a6f73" }}>
                  {stats.pendingCourses > 0 ? `${stats.pendingCourses} course${stats.pendingCourses !== 1 ? "s" : ""} awaiting review` : "All caught up"}
                </p>
              </div>
              <Link to="/admin/approvals" style={{ fontSize: 13, color: "#5f4999", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #5f4999", paddingBottom: 1 }}>
                View all
              </Link>
            </div>

            {pendingCourses.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ color: "#1c1d1f", fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>No pending courses</p>
                <p style={{ color: "#6a6f73", fontSize: 13, margin: 0 }}>All submissions have been reviewed.</p>
              </div>
            ) : (
              <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                {pendingCourses.map((course) => (
                  <PendingCourseCard
                    key={course._id}
                    course={course}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    approving={approvingId === course._id}
                    rejecting={rejectingId === course._id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Breakdown */}
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, padding: "18px 20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#1c1d1f", textTransform: "uppercase", letterSpacing: "0.05em" }}>Platform Breakdown</h3>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Users</div>
                <BreakdownRow label="Students" count={stats.students} total={stats.totalUsers} accent="#5f4999" />
                <BreakdownRow label="Instructors" count={stats.instructors} total={stats.totalUsers} accent="#0ea5e9" />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Courses</div>
                <BreakdownRow label="Published" count={stats.publishedCourses} total={stats.totalCourses} accent="#16a34a" />
                <BreakdownRow label="Pending" count={stats.pendingCourses} total={stats.totalCourses} accent="#d97706" />
                <BreakdownRow label="Draft" count={stats.draftCourses} total={stats.totalCourses} accent="#9ca3af" />
                <BreakdownRow label="Rejected" count={stats.rejectedCourses} total={stats.totalCourses} accent="#dc2626" />
              </div>
            </div>

            {/* Revenue highlight */}
            <div style={{ background: "linear-gradient(135deg, #3c3168 0%, #5f4999 100%)", borderRadius: 4, padding: "18px 20px", color: "#fff" }}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue This Month</div>
              <div style={{ fontSize: 30, fontWeight: 900, margin: "8px 0 4px", letterSpacing: "-0.03em" }}>${fmt(stats.revenueThisMonth)}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>All-time: ${fmt(stats.totalRevenue)}</div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

          {/* Recent Registrations */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8e8e8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1c1d1f", letterSpacing: "-0.01em" }}>Recent Registrations</h2>
              <Link to="/admin/users" style={{ fontSize: 13, color: "#5f4999", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #5f4999", paddingBottom: 1 }}>
                Manage
              </Link>
            </div>
            {recentUsers.map((u, i) => {
              const initial = u.name ? u.name.charAt(0).toUpperCase() : "?";
              const roleColor = u.role === "instructor" ? "#0ea5e9" : u.role === "admin" ? "#dc2626" : "#5f4999";
              const roleBg = u.role === "instructor" ? "#e0f2fe" : u.role === "admin" ? "#fee2e2" : "#ede9f8";
              return (
                <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < recentUsers.length - 1 ? "1px solid #e8e8e8" : "none" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ede9f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#5f4999", flexShrink: 0 }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#1c1d1f", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#6a6f73", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                    <span style={{ background: roleBg, color: roleColor, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 2, textTransform: "capitalize" }}>
                      {u.role}
                    </span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{timeAgo(u.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue chart */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, padding: "18px 20px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#1c1d1f", letterSpacing: "-0.01em" }}>Revenue — Last 7 Days</h3>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "#6a6f73" }}>Daily revenue from payments</p>
            {!revenueByDay?.some((d) => d.amount > 0) ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>No revenue data yet.</div>
            ) : (
              <RevenueChart data={revenueByDay} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
