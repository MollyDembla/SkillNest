import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/instructorService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

const STATUS_STYLES = {
  published: { background: "#dcfce7", color: "#16a34a", label: "Published" },
  draft: { background: "#f3f4f6", color: "#6b7280", label: "Draft" },
  pending: { background: "#fef3c7", color: "#d97706", label: "Pending" },
  rejected: { background: "#fee2e2", color: "#dc2626", label: "Rejected" },
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString();
}

function StatCard({ label, value, color, svgPath }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "22px 24px",
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
          width: 48,
          height: 48,
          borderRadius: 14,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {svgPath}
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function CourseRow({ course }) {
  const badge = STATUS_STYLES[course.status] || STATUS_STYLES.draft;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 20px",
        borderBottom: "1px solid #f3f0fa",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#faf8ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 64,
          height: 44,
          borderRadius: 8,
          overflow: "hidden",
          background: "#e9e4f7",
          flexShrink: 0,
        }}
      >
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
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9b8ec4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            color: "#1a1a2e",
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {course.title}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
          ${course.price?.toFixed(2) || "0.00"}
          {course.averageRating > 0 && (
            <span style={{ marginLeft: 10 }}>⭐ {course.averageRating} ({course.reviewsCount})</span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <span
        style={{
          background: badge.background,
          color: badge.color,
          fontSize: 11,
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: 99,
          flexShrink: 0,
        }}
      >
        {badge.label}
      </span>

      {/* Students */}
      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 64 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
          {course.enrollmentCount}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>students</div>
      </div>

      {/* Revenue */}
      <div style={{ textAlign: "right", flexShrink: 0, minWidth: 72 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
          ${course.revenue?.toFixed(2) || "0.00"}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>revenue</div>
      </div>
    </div>
  );
}

function EnrollmentRow({ enrollment }) {
  const student = enrollment.student;
  const initial = student?.name ? student.name.charAt(0).toUpperCase() : "?";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        borderBottom: "1px solid #f3f0fa",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: purpleLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 800,
          color: purple,
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 13 }}>
          {student?.name || "Unknown"}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {enrollment.course?.title || ""}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>
        {timeAgo(enrollment.createdAt)}
      </div>
    </div>
  );
}

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: 48,
              height: 48,
              border: `4px solid ${purpleLight}`,
              borderTop: `4px solid ${purple}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6b7280" }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 style={{ color: "#1a1a2e", margin: "0 0 10px", fontSize: 22, fontWeight: 900 }}>Something went wrong</h2>
        <p style={{ color: "#6b7280", margin: "0 0 20px" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ background: purple, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}
        >
          Try again
        </button>
      </div>
    );
  }

  const { stats, courses, recentEnrollments } = data;

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)` }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "48px 24px 60px",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "I"}
          </div>
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: 28, fontWeight: 800 }}>
              Welcome back, {firstName}!
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", margin: "6px 0 0", fontSize: 15 }}>
              {stats.publishedCourses === 0
                ? "Create your first course and start teaching today."
                : `${stats.publishedCourses} course${stats.publishedCourses !== 1 ? "s" : ""} published · ${stats.totalStudents} student${stats.totalStudents !== 1 ? "s" : ""} enrolled`}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "-32px auto 0", padding: "0 24px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
          <StatCard label="Total Courses" value={stats.totalCourses} color={purple}
            svgPath={<><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></>}
          />
          <StatCard label="Published" value={stats.publishedCourses} color="#16a34a"
            svgPath={<><polyline points="20 6 9 17 4 12"/></>}
          />
          <StatCard label="Total Students" value={stats.totalStudents} color="#0ea5e9"
            svgPath={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>}
          />
          <StatCard
            label="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            color="#f97316"
            svgPath={<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>}
          />
          <StatCard
            label="Avg Rating"
            value={stats.averageRating > 0 ? stats.averageRating : "—"}
            color="#eab308"
            svgPath={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>}
          />
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Courses list */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>
                My Courses
              </h2>
              <Link
                to="/instructor/courses/create"
                style={{
                  background: purple,
                  color: "#fff",
                  borderRadius: 10,
                  padding: "8px 18px",
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                + New Course
              </Link>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              {courses.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: purpleLight, color: purple, marginBottom: 16 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                    </svg>
                  </div>
                  <h3 style={{ color: "#1a1a2e", margin: "0 0 8px" }}>No courses yet</h3>
                  <p style={{ color: "#6b7280", margin: "0 0 20px", fontSize: 14 }}>
                    Create your first course to start teaching on SkillNest.
                  </p>
                  <Link
                    to="/instructor/courses/create"
                    style={{
                      background: purple,
                      color: "#fff",
                      padding: "10px 28px",
                      borderRadius: 10,
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: 14,
                    }}
                  >
                    Create a Course
                  </Link>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "10px 20px",
                      background: "#faf8ff",
                      borderBottom: "1px solid #f3f0fa",
                    }}
                  >
                    <div style={{ width: 64, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Course
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0, minWidth: 72 }}>
                      Status
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right", flexShrink: 0, minWidth: 64 }}>
                      Students
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right", flexShrink: 0, minWidth: 72 }}>
                      Revenue
                    </div>
                  </div>
                  {courses.map((course) => (
                    <CourseRow key={course._id} course={course} />
                  ))}
                </>
              )}
            </div>
          </section>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Course status breakdown */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "20px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>
                Course Status
              </h3>
              {[
                { label: "Published", count: stats.publishedCourses, color: "#16a34a", bg: "#dcfce7" },
                { label: "Pending Review", count: stats.pendingCourses, color: "#d97706", bg: "#fef3c7" },
                { label: "Draft", count: stats.draftCourses, color: "#6b7280", bg: "#f3f4f6" },
                { label: "Rejected", count: stats.totalCourses - stats.publishedCourses - stats.pendingCourses - stats.draftCourses, color: "#dc2626", bg: "#fee2e2" },
              ]
                .filter((item) => item.count > 0)
                .map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: item.color,
                        }}
                      />
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                        {item.label}
                      </span>
                    </div>
                    <span
                      style={{
                        background: item.bg,
                        color: item.color,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: 99,
                      }}
                    >
                      {item.count}
                    </span>
                  </div>
                ))}
              {stats.totalCourses === 0 && (
                <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>No courses yet.</p>
              )}
            </div>

            {/* Recent Enrollments */}
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px 12px",
                  borderBottom: "1px solid #f3f0fa",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>
                  Recent Enrollments
                </h3>
              </div>
              {recentEnrollments.length === 0 ? (
                <div style={{ padding: "24px 20px", textAlign: "center" }}>
                  <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
                    No enrollments yet.
                  </p>
                </div>
              ) : (
                recentEnrollments.map((enrollment) => (
                  <EnrollmentRow key={enrollment._id} enrollment={enrollment} />
                ))
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
