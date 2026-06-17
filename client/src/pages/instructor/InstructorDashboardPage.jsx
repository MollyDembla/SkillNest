import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/instructorService";

/* ─── Design Tokens ──────────────────────────────────────────── */
const C = {
  brand:       "#5f4999",
  brandDark:   "#3c3168",
  brandLight:  "#ede9f8",
  brandMid:    "#7c67b3",
  bg:          "#f4f5f7",
  surface:     "#ffffff",
  border:      "#e8e8ee",
  textPrimary: "#111827",
  textSecondary:"#6b7280",
  textMuted:   "#9ca3af",
  green:       "#059669",
  greenBg:     "#d1fae5",
  amber:       "#d97706",
  amberBg:     "#fef3c7",
  red:         "#dc2626",
  redBg:       "#fee2e2",
  blue:        "#0284c7",
  blueBg:      "#e0f2fe",
  orange:      "#ea580c",
  orangeBg:    "#ffedd5",
  yellow:      "#ca8a04",
  yellowBg:    "#fef9c3",
};

/* ─── Time formatting ─────────────────────────────────────────── */
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ─── SVG Icons ───────────────────────────────────────────────── */
const Icon = {
  courses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  students: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  revenue: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  starFilled: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={C.yellow} stroke={C.yellow} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  arrowRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  book: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  ),
  person: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  error: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  dot: (color) => (
    <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill={color}/></svg>
  ),
};

/* ─── Status config ───────────────────────────────────────────── */
const STATUS = {
  published: { bg: C.greenBg, color: C.green, label: "Published" },
  draft:     { bg: "#f3f4f6", color: C.textSecondary, label: "Draft" },
  pending:   { bg: C.amberBg, color: C.amber, label: "Under Review" },
  rejected:  { bg: C.redBg, color: C.red, label: "Rejected" },
};

/* ─── Metric Card ─────────────────────────────────────────────── */
function MetricCard({ label, value, icon, accentColor, accentBg }) {
  return (
    <div style={{
      background: C.surface,
      borderRadius: 12,
      padding: "20px 24px",
      border: `1px solid ${C.border}`,
      display: "flex",
      alignItems: "center",
      gap: 16,
      flex: "1 1 160px",
      minWidth: 160,
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: accentBg,
        color: accentColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.textPrimary, lineHeight: 1, letterSpacing: "-0.5px" }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 5, fontWeight: 500, letterSpacing: "0.02em" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/* ─── Course Row ──────────────────────────────────────────────── */
function CourseRow({ course }) {
  const badge = STATUS[course.status] || STATUS.draft;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 20px",
      borderBottom: `1px solid ${C.border}`,
      transition: "background 0.15s",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Thumbnail */}
      <div style={{
        width: 60,
        height: 40,
        borderRadius: 6,
        overflow: "hidden",
        background: C.brandLight,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.brand,
      }}>
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : Icon.book
        }
      </div>

      {/* Title + price */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600,
          color: C.textPrimary,
          fontSize: 13.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {course.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <span style={{ fontSize: 12, color: C.textMuted }}>
            ${course.price?.toFixed(2) || "0.00"}
          </span>
          {course.averageRating > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: C.textSecondary }}>
              {Icon.starFilled}
              {course.averageRating}
              <span style={{ color: C.textMuted }}>({course.reviewsCount})</span>
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <span style={{
        background: badge.bg,
        color: badge.color,
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 6,
        flexShrink: 0,
        letterSpacing: "0.01em",
      }}>
        {badge.label}
      </span>

      {/* Students */}
      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 60 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{course.enrollmentCount}</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>students</div>
      </div>

      {/* Revenue */}
      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 72 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>${course.revenue?.toFixed(2) || "0.00"}</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>revenue</div>
      </div>
    </div>
  );
}

/* ─── Enrollment Row ──────────────────────────────────────────── */
function EnrollmentRow({ enrollment }) {
  const student = enrollment.student;
  const initial = student?.name ? student.name.charAt(0).toUpperCase() : "?";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 20px",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: C.brandLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 700,
        color: C.brand,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}>
        {student?.avatar
          ? <img src={student.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          : initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: C.textPrimary, fontSize: 13 }}>
          {student?.name || "Unknown student"}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
          {enrollment.course?.title || ""}
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
        {timeAgo(enrollment.createdAt)}
      </div>
    </div>
  );
}

/* ─── Section Header ──────────────────────────────────────────── */
function SectionHeader({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.1px" }}>
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ─── Skeleton loader ─────────────────────────────────────────── */
function Skeleton({ w = "100%", h = 16, r = 6 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: r, background: "linear-gradient(90deg,#f0edf9 25%,#e4dff4 50%,#f0edf9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
  );
}

/* ─── Main Dashboard ──────────────────────────────────────────── */
export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Instructor";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  /* ── Loading State ── */
  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh" }}>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div style={{ background: `linear-gradient(130deg, ${C.brandDark} 0%, ${C.brand} 100%)`, padding: "40px 0 64px" }}>
          <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 28px" }}>
            <Skeleton w={220} h={14} r={4} />
            <div style={{ marginTop: 14 }}><Skeleton w={320} h={32} r={6} /></div>
          </div>
        </div>
        <div style={{ maxWidth: 1160, margin: "-36px auto 0", padding: "0 28px" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ flex: "1 1 160px", minWidth: 160, background: C.surface, borderRadius: 12, padding: "20px 24px", border: `1px solid ${C.border}` }}><Skeleton w={44} h={44} r={10} /></div>)}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error State ── */
  if (error) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.redBg, color: C.red, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            {Icon.error}
          </div>
          <h2 style={{ color: C.textPrimary, margin: "0 0 10px", fontSize: 20, fontWeight: 700 }}>Unable to load dashboard</h2>
          <p style={{ color: C.textSecondary, margin: "0 0 24px", fontSize: 14, lineHeight: 1.6 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: C.brand, color: "#fff", border: "none", borderRadius: 8, padding: "10px 28px", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, courses, recentEnrollments } = data;
  const rejectedCount = stats.totalCourses - stats.publishedCourses - (stats.pendingCourses || 0) - (stats.draftCourses || 0);

  const statusBreakdown = [
    { label: "Published",    count: stats.publishedCourses,  color: C.green,  bg: C.greenBg },
    { label: "Under Review", count: stats.pendingCourses || 0, color: C.amber, bg: C.amberBg },
    { label: "Draft",        count: stats.draftCourses || 0, color: C.textSecondary, bg: "#f3f4f6" },
    { label: "Rejected",     count: rejectedCount > 0 ? rejectedCount : 0, color: C.red, bg: C.redBg },
  ].filter(s => s.count > 0);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "inherit" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .dash-fadein { animation: fadeUp 0.4s ease both; }
        .dash-fadein-d1 { animation-delay: 0.05s; }
        .dash-fadein-d2 { animation-delay: 0.1s; }
        .dash-fadein-d3 { animation-delay: 0.15s; }
        .instructor-two-col { display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
        @media (max-width: 900px) {
          .instructor-two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .dash-hero-inner { padding: 28px 16px 52px !important; flex-direction: column !important; align-items: flex-start !important; }
          .dash-content-area { padding: 0 16px 40px !important; }
        }
      `}</style>

      {/* ── Hero Banner ── */}
      <div style={{ background: `linear-gradient(130deg, ${C.brandDark} 0%, ${C.brand} 100%)` }}>
        <div className="dash-hero-inner" style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 28px 68px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div className="dash-fadein" style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: "#fff",
              flexShrink: 0, overflow: "hidden",
            }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : (user?.name?.charAt(0).toUpperCase() || "I")}
            </div>
            <div>
              <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 12.5, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {today}
              </p>
              <h1 style={{ color: "#fff", margin: "6px 0 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", margin: "5px 0 0", fontSize: 13.5 }}>
                {stats.totalCourses === 0
                  ? "Create your first course to get started."
                  : `${stats.publishedCourses} published course${stats.publishedCourses !== 1 ? "s" : ""} · ${stats.totalStudents} student${stats.totalStudents !== 1 ? "s" : ""} enrolled`}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="dash-fadein dash-fadein-d1" style={{ display: "flex", gap: 10 }}>
            <Link
              to="/instructor/courses/create"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "#fff", color: C.brand,
                borderRadius: 8, padding: "9px 18px",
                fontWeight: 700, fontSize: 13, textDecoration: "none",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.15)"; }}
            >
              {Icon.plus} New Course
            </Link>
            <Link
              to="/instructor/analytics"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,0.12)", color: "#fff",
                borderRadius: 8, padding: "9px 18px",
                fontWeight: 600, fontSize: 13, textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.25)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            >
              {Icon.analytics} Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="dash-content-area" style={{ maxWidth: 1160, margin: "-36px auto 0", padding: "0 28px 60px" }}>

        {/* ── Metric Cards ── */}
        <div className="dash-fadein dash-fadein-d1" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
          <MetricCard label="Total Courses"  value={stats.totalCourses}                           icon={Icon.courses}  accentColor={C.brand}  accentBg={C.brandLight} />
          <MetricCard label="Published"      value={stats.publishedCourses}                       icon={Icon.check}    accentColor={C.green}  accentBg={C.greenBg} />
          <MetricCard label="Total Students" value={stats.totalStudents}                          icon={Icon.students} accentColor={C.blue}   accentBg={C.blueBg} />
          <MetricCard label="Total Revenue"  value={`$${stats.totalRevenue?.toFixed(2) ?? "0.00"}`} icon={Icon.revenue}  accentColor={C.orange} accentBg={C.orangeBg} />
          <MetricCard label="Avg. Rating"    value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"} icon={Icon.star} accentColor={C.yellow} accentBg={C.yellowBg} />
        </div>

        {/* ── Two-column layout ── */}
        <div className="instructor-two-col">

          {/* LEFT — Courses table */}
          <div className="dash-fadein dash-fadein-d2">
            <SectionHeader
              title="My Courses"
              action={
                <Link
                  to="/instructor/courses"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: C.brand, fontWeight: 600, textDecoration: "none" }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                >
                  View all {Icon.arrowRight}
                </Link>
              }
            />

            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {courses.length === 0 ? (
                <div style={{ padding: "52px 24px", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.brandLight, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    {Icon.courses}
                  </div>
                  <h3 style={{ color: C.textPrimary, margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>No courses yet</h3>
                  <p style={{ color: C.textSecondary, margin: "0 0 24px", fontSize: 13, lineHeight: 1.6 }}>
                    Create and publish your first course to start teaching on SkillNest.
                  </p>
                  <Link
                    to="/instructor/courses/create"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: C.brand, color: "#fff",
                      padding: "10px 24px", borderRadius: 8, fontWeight: 600,
                      textDecoration: "none", fontSize: 13,
                    }}
                  >
                    {Icon.plus} Create a Course
                  </Link>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "10px 20px",
                    background: "#fafafa",
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ width: 60, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Course</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0, minWidth: 80 }}>Status</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right", flexShrink: 0, minWidth: 60 }}>Students</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "right", flexShrink: 0, minWidth: 72 }}>Revenue</div>
                  </div>
                  {courses.map(course => <CourseRow key={course._id} course={course} />)}
                </>
              )}
            </div>
          </div>

          {/* RIGHT — Sidebar panels */}
          <div className="dash-fadein dash-fadein-d3" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Course Status Breakdown */}
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13.5, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.1px" }}>
                Course Status
              </h3>
              {statusBreakdown.length === 0 ? (
                <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>No courses to display.</p>
              ) : (
                <>
                  {statusBreakdown.map(item => (
                    <div key={item.label} style={{ marginBottom: 12, lastChild: { marginBottom: 0 } }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          {Icon.dot(item.color)}
                          <span style={{ fontSize: 13, color: C.textSecondary, fontWeight: 500 }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.count}</span>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: 4, borderRadius: 4, background: item.bg, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          borderRadius: 4,
                          background: item.color,
                          width: stats.totalCourses > 0 ? `${(item.count / stats.totalCourses) * 100}%` : "0%",
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>Total courses</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{stats.totalCourses}</span>
                  </div>
                </>
              )}
            </div>

            {/* Recent Enrollments */}
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.textPrimary }}>Recent Enrollments</h3>
                {recentEnrollments.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 600, background: C.brandLight, color: C.brand, padding: "2px 8px", borderRadius: 20 }}>
                    {recentEnrollments.length} new
                  </span>
                )}
              </div>
              {recentEnrollments.length === 0 ? (
                <div style={{ padding: "28px 20px", textAlign: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.brandLight, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    {Icon.person}
                  </div>
                  <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>No enrollments yet</p>
                </div>
              ) : (
                recentEnrollments.map(enrollment => (
                  <EnrollmentRow key={enrollment._id} enrollment={enrollment} />
                ))
              )}
            </div>

            {/* Quick Links */}
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}` }}>
                <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: C.textPrimary }}>Quick Actions</h3>
              </div>
              {[
                { to: "/instructor/courses/create", label: "Create a new course",   desc: "Start building your next course" },
                { to: "/instructor/courses",        label: "Manage courses",        desc: "Edit, publish, or review courses" },
                { to: "/instructor/analytics",      label: "View analytics",        desc: "Revenue, trends, and insights" },
                { to: "/instructor/profile",        label: "Edit profile",          desc: "Update your instructor profile" },
              ].map(({ to, label, desc }) => (
                <Link
                  key={to}
                  to={to}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    textDecoration: "none",
                    transition: "background 0.15s",
                    lastChild: { borderBottom: "none" },
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{label}</div>
                    <div style={{ fontSize: 11.5, color: C.textMuted, marginTop: 2 }}>{desc}</div>
                  </div>
                  <span style={{ color: C.textMuted, flexShrink: 0 }}>{Icon.arrowRight}</span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
