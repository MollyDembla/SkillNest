import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getInstructorAnalytics } from "../../services/analyticsService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";
const green = "#16a34a";
const greenLight = "#dcfce7";

// ─── helpers ─────────────────────────────────────────────────
function fmt(n, prefix = "") {
  if (n === undefined || n === null) return "—";
  return prefix + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

function fmtMoney(n) {
  if (!n) return "$0";
  return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function shortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function dayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── KPI card ────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color = purple, highlight }) {
  return (
    <div
      style={{
        background: highlight ? `linear-gradient(135deg, ${purpleDark}, ${purple})` : "#fff",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        display: "flex",
        gap: 14,
        alignItems: "center",
        flex: "1 1 0",
        minWidth: 150,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 13,
          background: highlight ? "rgba(255,255,255,0.15)" : color + "18",
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
        <div style={{ fontSize: 24, fontWeight: 900, color: highlight ? "#fff" : "#1a1a2e", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: highlight ? "rgba(255,255,255,0.65)" : "#6b7280", marginTop: 3, fontWeight: 500 }}>
          {label}
        </div>
        {sub && (
          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: highlight ? "rgba(255,255,255,0.8)" : color }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── bar chart ───────────────────────────────────────────────
function BarChart({ data, valueKey, color, formatValue, height = 120 }) {
  const [tooltip, setTooltip] = useState(null);
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <div style={{ position: "relative" }}>
      {/* Tooltip */}
      {tooltip !== null && (
        <div
          style={{
            position: "absolute",
            top: -38,
            left: `${(tooltip / data.length) * 100}%`,
            transform: "translateX(-50%)",
            background: purpleDark,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            padding: "5px 9px",
            borderRadius: 7,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          {shortDate(data[tooltip].date)}: {formatValue(data[tooltip][valueKey])}
        </div>
      )}

      {/* Bars */}
      <div
        style={{
          display: "flex",
          gap: 2,
          alignItems: "flex-end",
          height,
          padding: "0 2px",
        }}
      >
        {data.map((d, i) => {
          const barH = max > 0 ? Math.max((d[valueKey] / max) * (height - 16), d[valueKey] > 0 ? 4 : 0) : 0;
          return (
            <div
              key={d.date}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", cursor: "pointer" }}
              onMouseEnter={() => setTooltip(i)}
              onMouseLeave={() => setTooltip(null)}
            >
              <div
                style={{
                  width: "100%",
                  height: barH,
                  background: tooltip === i ? color : color + "aa",
                  borderRadius: "3px 3px 0 0",
                  transition: "height 0.3s ease, background 0.1s",
                  minHeight: 0,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels — show every ~5 days */}
      <div
        style={{
          display: "flex",
          gap: 2,
          padding: "6px 2px 0",
          borderTop: "1px solid #f3f0fa",
        }}
      >
        {data.map((d, i) => (
          <div
            key={d.date}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 9,
              color: "#9ca3af",
              overflow: "hidden",
            }}
          >
            {/* Show label every ~5 entries to avoid crowding */}
            {i % Math.ceil(data.length / 6) === 0 ? shortDate(d.date) : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── rating distribution ─────────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ width: 42, fontSize: 12, color: "#374151", fontWeight: 700, textAlign: "right", flexShrink: 0 }}>
        {star} ★
      </div>
      <div style={{ flex: 1, height: 8, borderRadius: 99, background: "#f3f0fa", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: star >= 4 ? "#f59e0b" : star === 3 ? "#fb923c" : "#ef4444",
            borderRadius: 99,
            transition: "width 0.5s ease",
          }}
        />
      </div>
      <div style={{ width: 28, fontSize: 12, color: "#6b7280", fontWeight: 600, flexShrink: 0 }}>
        {count}
      </div>
    </div>
  );
}

// ─── course table row ─────────────────────────────────────────
function CourseRow({ course, rank }) {
  const statusStyle = {
    published: { bg: "#dcfce7", color: "#166534" },
    pending:   { bg: "#fef3c7", color: "#92400e" },
    draft:     { bg: "#f3f4f6", color: "#374151" },
    rejected:  { bg: "#fee2e2", color: "#991b1b" },
  }[course.status] || { bg: "#f3f4f6", color: "#374151" };

  return (
    <tr style={{ borderBottom: "1px solid #f7f5ff" }}>
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#9ca3af", width: 20, textAlign: "center", flexShrink: 0 }}>
            #{rank}
          </span>
          <div style={{ width: 44, height: 32, borderRadius: 7, overflow: "hidden", background: "#e9e4f7", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {course.thumbnail
              ? <img src={course.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
              {course.title}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>${course.price?.toFixed(2)}</div>
          </div>
        </div>
      </td>

      <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: statusStyle.bg, color: statusStyle.color, textTransform: "capitalize" }}>
          {course.status}
        </span>
      </td>

      <td style={{ padding: "14px 12px", fontSize: 13, fontWeight: 700, color: "#1a1a2e", textAlign: "right", whiteSpace: "nowrap" }}>
        {course.enrollments}
      </td>

      <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: "#f3f0fa", overflow: "hidden", minWidth: 60 }}>
            <div style={{ height: "100%", width: `${course.completionRate}%`, background: course.completionRate >= 50 ? green : purple, borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", minWidth: 32 }}>{course.completionRate}%</span>
        </div>
      </td>

      <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
        {course.averageRating > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#f59e0b", fontSize: 13 }}>★</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{course.averageRating.toFixed(1)}</span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>({course.reviewsCount})</span>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>No reviews</span>
        )}
      </td>

      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 800, color: green, textAlign: "right", whiteSpace: "nowrap" }}>
        {fmtMoney(course.revenue)}
      </td>

      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        <Link
          to={`/instructor/courses/${course._id}/edit`}
          style={{ fontSize: 11, fontWeight: 700, color: purple, textDecoration: "none", background: purpleLight, padding: "4px 10px", borderRadius: 7 }}
        >
          Edit
        </Link>
      </td>
    </tr>
  );
}

// ─── main page ────────────────────────────────────────────────
export default function InstructorAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(30); // 7 or 30

  useEffect(() => {
    getInstructorAnalytics()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  // Slice time-series to selected period
  const enrollmentsSeries = useMemo(
    () => (data?.enrollmentsByDay || []).slice(-period),
    [data, period]
  );
  const revenueSeries = useMemo(
    () => (data?.revenueByDay || []).slice(-period),
    [data, period]
  );

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5ff" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: "#9b8ec4", margin: 0, fontSize: 14 }}>Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 style={{ color: purpleDark }}>Something went wrong</h2>
        <p style={{ color: "#6b7280" }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ background: purple, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    );
  }

  // ── No courses yet ────────────────────────────────────────
  if (data?.empty) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5ff" }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: purpleLight, color: purple, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <h2 style={{ color: purpleDark, margin: "0 0 10px", fontWeight: 900 }}>No data yet</h2>
          <p style={{ color: "#6b7280", margin: "0 0 24px", lineHeight: 1.7 }}>
            Analytics will appear once you publish your first course and get enrollments.
          </p>
          <Link
            to="/instructor/courses/create"
            style={{ display: "inline-block", background: `linear-gradient(135deg, #8b6ef5, ${purple})`, color: "#fff", textDecoration: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 800, fontSize: 14 }}
          >
            Create Your First Course
          </Link>
        </div>
      </div>
    );
  }

  const { stats, ratingDistribution, courseBreakdown, recentEnrollments } = data;
  const totalReviews = Object.values(ratingDistribution || {}).reduce((a, b) => a + b, 0);

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(135deg, #1e1340 0%, ${purpleDark} 50%, ${purple} 100%)` }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px 52px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Link to="/instructor/dashboard" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                  ← Dashboard
                </Link>
              </div>
              <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900 }}>Analytics</h1>
              <p style={{ color: "rgba(255,255,255,0.55)", margin: "6px 0 0", fontSize: 13 }}>
                {stats.publishedCourses} published course{stats.publishedCourses !== 1 ? "s" : ""} · all-time performance
              </p>
            </div>

            {/* Period toggle */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 3, gap: 2 }}>
              {[7, 30].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  style={{
                    border: "none", borderRadius: 8, padding: "7px 16px",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    background: period === p ? "#fff" : "transparent",
                    color: period === p ? purple : "rgba(255,255,255,0.65)",
                    transition: "all 0.15s",
                  }}
                >
                  {p}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "-26px auto 0", padding: "0 24px" }}>

        {/* ── KPI cards ── */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
          <KpiCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            }
            label="Total Revenue" value={fmtMoney(stats.totalRevenue)} color={green} highlight
          />
          <KpiCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87" />
                <path d="M16 3.13a4 4 0 010 7.75" />
              </svg>
            }
            label="Total Students" value={fmt(stats.totalStudents)} color="#0ea5e9"
          />
          <KpiCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            }
            label="Enrollments" value={fmt(stats.totalEnrollments)} color={purple}
          />
          <KpiCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
            label="Avg Rating" value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"} sub={totalReviews > 0 ? `${totalReviews} reviews` : "No reviews yet"} color="#f59e0b"
          />
          <KpiCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            }
            label="Completion Rate" value={`${stats.completionRate}%`} sub={`${stats.totalCompleted} completed`} color="#8b5cf6"
          />
        </div>

        {/* ── Charts row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Enrollments chart */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: purpleDark }}>Enrollments</h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                  Last {period} days · {enrollmentsSeries.reduce((s, d) => s + d.count, 0)} total
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <BarChart data={enrollmentsSeries} valueKey="count" color={purple} formatValue={(v) => `${v} enrollment${v !== 1 ? "s" : ""}`} height={130} />
          </div>

          {/* Revenue chart */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: purpleDark }}>Revenue</h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                  Last {period} days · {fmtMoney(revenueSeries.reduce((s, d) => s + d.amount, 0))} total
                </p>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <BarChart data={revenueSeries} valueKey="amount" color={green} formatValue={(v) => fmtMoney(v)} height={130} />
          </div>
        </div>

        {/* ── Course performance table ── */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f0fa" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: purpleDark }}>Course Performance</h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>Sorted by total enrollments</p>
          </div>

          {courseBreakdown.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
              No course data yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#faf8ff", borderBottom: "2px solid #f3f0fa" }}>
                    {["Course", "Status", "Enrollments", "Completion", "Rating", "Revenue", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 16px",
                          textAlign: h === "Enrollments" || h === "Revenue" ? "right" : "left",
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
                  {courseBreakdown.map((course, i) => (
                    <CourseRow key={course._id} course={course} rank={i + 1} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Bottom row: rating distribution + recent enrollments ── */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>

          {/* Rating distribution */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: purpleDark }}>Rating Distribution</h3>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "#6b7280" }}>{totalReviews} review{totalReviews !== 1 ? "s" : ""} total</p>

            {totalReviews === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af", fontSize: 13 }}>
                No reviews yet.
              </div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: purpleDark, lineHeight: 1 }}>
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 22, color: "#f59e0b", letterSpacing: 2, margin: "6px 0 2px" }}>
                    {"★".repeat(Math.round(stats.avgRating))}{"☆".repeat(5 - Math.round(stats.avgRating))}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>Average rating</div>
                </div>
                {[5, 4, 3, 2, 1].map((star) => (
                  <RatingBar
                    key={star}
                    star={star}
                    count={ratingDistribution[star] || 0}
                    total={totalReviews}
                  />
                ))}
              </>
            )}
          </div>

          {/* Recent enrollments */}
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f0fa" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: purpleDark }}>Recent Enrollments</h3>
            </div>

            {recentEnrollments.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                No enrollments yet.
              </div>
            ) : (
              recentEnrollments.map((e, i) => {
                const initial = e.student?.name?.charAt(0).toUpperCase() || "?";
                const progress = e.progressPercentage || 0;
                const statusColor = e.status === "completed" ? green : progress > 0 ? purple : "#6b7280";
                const statusLabel = e.status === "completed" ? "Completed" : progress > 0 ? `${progress}% done` : "Not started";

                return (
                  <div
                    key={e._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "13px 24px",
                      borderBottom: i < recentEnrollments.length - 1 ? "1px solid #f7f5ff" : "none",
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: purpleLight, color: purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                      {e.student?.avatar
                        ? <img src={e.student.avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        : initial}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.student?.name || "Student"}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.course?.title || "—"}
                      </div>
                    </div>

                    {/* Status + time */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
                      <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{timeAgo(e.createdAt)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
