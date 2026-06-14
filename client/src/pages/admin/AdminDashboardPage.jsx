import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/adminService";
import { updateCourse } from "../../services/courseService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

// ─── helpers ────────────────────────────────────────────────
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
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

// ─── stat card ──────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flex: "1 1 0",
        minWidth: 150,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3, fontWeight: 500 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: color, fontWeight: 700, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── mini progress bar row ───────────────────────────────────
function BreakdownRow({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
          {fmt(count)} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ background: "#f3f0fa", borderRadius: 99, height: 7, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 99,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── revenue bar chart ───────────────────────────────────────
function RevenueChart({ data }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const match = data.find((r) => r.date === key);
    days.push({
      key,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      amount: match?.amount || 0,
    });
  }
  const max = Math.max(...days.map((d) => d.amount), 1);

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "flex-end",
          height: 100,
          padding: "0 4px",
        }}
      >
        {days.map((day) => {
          const barH = Math.max((day.amount / max) * 80, day.amount > 0 ? 6 : 0);
          return (
            <div
              key={day.key}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                justifyContent: "flex-end",
              }}
            >
              {day.amount > 0 && (
                <div style={{ fontSize: 10, color: purple, fontWeight: 700 }}>
                  ${day.amount.toFixed(0)}
                </div>
              )}
              <div
                style={{
                  width: "100%",
                  height: barH,
                  background:
                    day.amount > 0
                      ? `linear-gradient(180deg, #9c7ef5, ${purple})`
                      : "#f3f0fa",
                  borderRadius: "4px 4px 0 0",
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "6px 4px 0",
          borderTop: "1px solid #f3f0fa",
        }}
      >
        {days.map((day) => (
          <div
            key={day.key}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 10,
              color: "#9ca3af",
              fontWeight: 600,
            }}
          >
            {day.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── pending course card ─────────────────────────────────────
function PendingCourseCard({ course, onApprove, onReject, approving, rejecting }) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Thumbnail strip */}
      <div style={{ height: 90, background: "#e9e4f7", position: "relative", overflow: "hidden" }}>
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            📚
          </div>
        )}
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 99,
          }}
        >
          ${course.price?.toFixed(2) || "0.00"}
        </span>
      </div>

      <div style={{ padding: "12px 14px" }}>
        <div
          style={{
            fontWeight: 700,
            color: "#1a1a2e",
            fontSize: 13,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 2,
          }}
        >
          {course.title}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
          by {course.instructor?.name} · {course.category}
        </div>

        {!showRejectInput ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onApprove(course._id)}
              disabled={approving}
              style={{
                flex: 1,
                background: approving ? "#bbf7d0" : "#dcfce7",
                color: "#16a34a",
                border: "none",
                borderRadius: 8,
                padding: "7px 0",
                fontSize: 12,
                fontWeight: 700,
                cursor: approving ? "not-allowed" : "pointer",
              }}
            >
              {approving ? "…" : "✓ Approve"}
            </button>
            <button
              onClick={() => setShowRejectInput(true)}
              style={{
                flex: 1,
                background: "#fee2e2",
                color: "#dc2626",
                border: "none",
                borderRadius: 8,
                padding: "7px 0",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✕ Reject
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection…"
              style={{
                padding: "7px 10px",
                border: "1.5px solid #fca5a5",
                borderRadius: 8,
                fontSize: 12,
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setShowRejectInput(false)}
                style={{ flex: 1, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={() => onReject(course._id, reason)}
                disabled={rejecting}
                style={{ flex: 1, background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: rejecting ? "not-allowed" : "pointer" }}
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

// ─── main page ───────────────────────────────────────────────
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
      toast.success("Course approved and published!");
      setData((prev) => ({
        ...prev,
        pendingCourses: prev.pendingCourses.filter((c) => c._id !== courseId),
        stats: {
          ...prev.stats,
          pendingCourses: prev.stats.pendingCourses - 1,
          publishedCourses: prev.stats.publishedCourses + 1,
        },
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
        stats: {
          ...prev.stats,
          pendingCourses: prev.stats.pendingCourses - 1,
          rejectedCourses: (prev.stats.rejectedCourses || 0) + 1,
        },
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
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#6b7280" }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2 style={{ color: "#1a1a2e" }}>Something went wrong</h2>
        <p style={{ color: "#6b7280" }}>{error}</p>
        <button onClick={load} style={{ background: purple, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer", marginTop: 12 }}>
          Retry
        </button>
      </div>
    );
  }

  const { stats, pendingCourses, recentUsers, revenueByDay } = data;

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #1e1340 0%, ${purpleDark} 50%, ${purple} 100%)` }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "44px 24px 58px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              🛡️
            </div>
            <div>
              <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 800 }}>
                Admin Dashboard
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: "5px 0 0", fontSize: 14 }}>
                Welcome back, {firstName} · {fmt(stats.totalUsers)} users · {fmt(stats.totalCourses)} courses
              </p>
            </div>
          </div>
          {stats.pendingCourses > 0 && (
            <div style={{ background: "#fef3c7", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>⏳</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>
                  {stats.pendingCourses} course{stats.pendingCourses !== 1 ? "s" : ""} awaiting review
                </div>
                <div style={{ fontSize: 11, color: "#b45309" }}>Scroll down to approve or reject</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "-30px auto 0", padding: "0 24px" }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
          <StatCard label="Total Users" value={fmt(stats.totalUsers)} icon="👥" color={purple} sub={`${fmt(stats.students)} students · ${fmt(stats.instructors)} instructors`} />
          <StatCard label="Total Courses" value={fmt(stats.totalCourses)} icon="📚" color="#0ea5e9" sub={`${fmt(stats.publishedCourses)} published`} />
          <StatCard label="Enrollments" value={fmt(stats.totalEnrollments)} icon="🎓" color="#16a34a" />
          <StatCard label="Total Revenue" value={`$${fmt(stats.totalRevenue)}`} icon="💰" color="#f97316" sub={`$${fmt(stats.revenueThisMonth)} this month`} />
        </div>

        {/* ── Middle row: Pending Approvals + Breakdown ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>

          {/* Pending Approvals */}
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f3f0fa", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>Pending Approvals</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                  {stats.pendingCourses > 0 ? `${stats.pendingCourses} course${stats.pendingCourses !== 1 ? "s" : ""} awaiting review` : "All caught up!"}
                </p>
              </div>
            </div>

            {pendingCourses.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
                <h3 style={{ color: "#1a1a2e", margin: "0 0 6px" }}>No pending courses</h3>
                <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>All submissions have been reviewed.</p>
              </div>
            ) : (
              <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
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

          {/* Right column: breakdown + quick actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* User & course breakdown */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>Platform Breakdown</h3>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Users</div>
                <BreakdownRow label="Students" count={stats.students} total={stats.totalUsers} color="#6d4ef5" />
                <BreakdownRow label="Instructors" count={stats.instructors} total={stats.totalUsers} color="#0ea5e9" />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Courses</div>
                <BreakdownRow label="Published" count={stats.publishedCourses} total={stats.totalCourses} color="#16a34a" />
                <BreakdownRow label="Pending Review" count={stats.pendingCourses} total={stats.totalCourses} color="#d97706" />
                <BreakdownRow label="Draft" count={stats.draftCourses} total={stats.totalCourses} color="#6b7280" />
                <BreakdownRow label="Rejected" count={stats.rejectedCourses} total={stats.totalCourses} color="#dc2626" />
              </div>
            </div>

            {/* Revenue this month highlight */}
            <div style={{ background: `linear-gradient(135deg, ${purpleDark}, ${purple})`, borderRadius: 16, padding: "20px 22px", color: "#fff" }}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue This Month</div>
              <div style={{ fontSize: 32, fontWeight: 900, margin: "8px 0 4px" }}>${fmt(stats.revenueThisMonth)}</div>
              <div style={{ fontSize: 12, opacity: 0.65 }}>All-time: ${fmt(stats.totalRevenue)}</div>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Recent Users + Revenue Chart ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 28 }}>

          {/* Recent Registrations */}
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f3f0fa" }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>Recent Registrations</h2>
            </div>
            {recentUsers.map((u, i) => {
              const initial = u.name ? u.name.charAt(0).toUpperCase() : "?";
              const roleColor = u.role === "instructor" ? "#0ea5e9" : u.role === "admin" ? "#dc2626" : purple;
              const roleBg = u.role === "instructor" ? "#e0f2fe" : u.role === "admin" ? "#fee2e2" : purpleLight;
              return (
                <div
                  key={u._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "13px 22px",
                    borderBottom: i < recentUsers.length - 1 ? "1px solid #f3f0fa" : "none",
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: purpleLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: purple, flexShrink: 0 }}>
                    {initial}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ background: roleBg, color: roleColor, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, textTransform: "capitalize" }}>
                      {u.role}
                    </span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{timeAgo(u.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue chart */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>Revenue — Last 7 Days</h3>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "#6b7280" }}>Daily revenue from succeeded payments</p>
            {revenueByDay.length === 0 && !revenueByDay.some((d) => d.amount > 0) ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>No revenue data yet.</div>
            ) : (
              <RevenueChart data={revenueByDay} />
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <section>
          <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>Quick Actions</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { to: "/admin/users", label: "👥 Manage Users" },
              { to: "/admin/courses", label: "📋 Course Approvals" },
              { to: "/admin/analytics", label: "📊 Analytics" },
              { to: "/admin/reports", label: "📄 Reports" },
              { to: "/courses", label: "🔍 Browse Catalog" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  background: "#fff",
                  color: purple,
                  border: `2px solid ${purpleLight}`,
                  borderRadius: 12,
                  padding: "10px 20px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = purpleLight;
                  e.currentTarget.style.borderColor = purple;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.borderColor = purpleLight;
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
