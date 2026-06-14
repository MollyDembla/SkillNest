import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/studentService";
import { getRecommendations } from "../../services/aiService";

const purple     = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

// ── Stat card (no icon, clean typographic) ───────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px 24px",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        borderTop: `3px solid ${accent}`,
        flex: "1 1 0",
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 900, color: purpleDark, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────
function ProgressBar({ pct }) {
  return (
    <div style={{ background: "#e9e4f7", borderRadius: 99, height: 5, overflow: "hidden" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${purple}, #9c7ef5)`,
          borderRadius: 99,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

// ── Continue learning card ───────────────────────────────────────
function ContinueCard({ enrollment }) {
  const course = enrollment.course;
  if (!course) return null;
  const pct = enrollment.progressPercentage || 0;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 76,
          height: 54,
          borderRadius: 8,
          overflow: "hidden",
          flexShrink: 0,
          background: "#e9e4f7",
        }}
      >
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: purpleLight }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/courses/${course._id}`} style={{ textDecoration: "none" }}>
          <div
            style={{
              fontWeight: 700,
              color: purpleDark,
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 2,
            }}
          >
            {course.title}
          </div>
        </Link>
        <div style={{ fontSize: 12, color: "#9b8ec4", marginBottom: 8 }}>{course.instructor?.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <ProgressBar pct={pct} />
          </div>
          <span style={{ fontSize: 11, color: purple, fontWeight: 700, flexShrink: 0 }}>{pct}%</span>
        </div>
      </div>

      <Link
        to={pct === 0 ? `/courses/${course._id}` : `/learn/${course._id}`}
        style={{
          background: purple,
          color: "#fff",
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 700,
          textDecoration: "none",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {pct === 0 ? "Start" : "Continue"}
      </Link>
    </div>
  );
}

// ── Mini library card ────────────────────────────────────────────
function CourseMinCard({ enrollment }) {
  const course = enrollment.course;
  if (!course) return null;
  const isCompleted = enrollment.status === "completed" || enrollment.progressPercentage >= 100;

  return (
    <Link to={`/courses/${course._id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(95,73,153,0.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 8px rgba(0,0,0,0.06)"; }}
      >
        <div style={{ height: 110, background: "#e9e4f7", position: "relative", overflow: "hidden" }}>
          {course.thumbnail
            ? <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: purpleLight }} />
          }
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: isCompleted ? "#16a34a" : purple,
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 99,
            }}
          >
            {isCompleted ? "Completed" : `${enrollment.progressPercentage || 0}%`}
          </div>
        </div>
        <div style={{ padding: "12px 14px" }}>
          <div style={{ fontWeight: 700, color: purpleDark, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {course.title}
          </div>
          <div style={{ fontSize: 11, color: "#9b8ec4", marginTop: 3 }}>{course.instructor?.name}</div>
          {!isCompleted && (
            <div style={{ marginTop: 8 }}>
              <ProgressBar pct={enrollment.progressPercentage || 0} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── AI recommendation card ───────────────────────────────────────
function RecommendedCourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug || course._id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transition: "transform 0.15s, box-shadow 0.15s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(95,73,153,0.12)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 8px rgba(0,0,0,0.06)"; }}
      >
        <div style={{ height: 110, background: "#e9e4f7", overflow: "hidden", flexShrink: 0 }}>
          {course.thumbnail
            ? <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: purpleLight }} />
          }
        </div>
        <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, color: purpleDark, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
            {course.title}
          </div>
          <div style={{ fontSize: 11, color: "#9b8ec4" }}>{course.instructor?.name}</div>
          <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: purple, fontWeight: 700 }}>
              {course.averageRating ? `${course.averageRating.toFixed(1)} / 5` : "New"}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: purpleDark }}>
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Main page ────────────────────────────────────────────────────
export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));

    getRecommendations(8)
      .then((res) => setRecommendations(res.data?.recommendations || []))
      .catch(() => {});
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: 48, height: 48,
              border: `4px solid ${purpleLight}`,
              borderTop: `4px solid ${purple}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#9b8ec4", fontSize: 14 }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ color: purpleDark, marginTop: 12 }}>Something went wrong</h2>
        <p style={{ color: "#6b7280" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 16, background: purple, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}
        >
          Try again
        </button>
      </div>
    );
  }

  const { stats, continueLearning, startNext, recentEnrollments } = data;
  const activeLearning = continueLearning?.length > 0 ? continueLearning : startNext;

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)` }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "44px 24px 56px",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: 26, fontWeight: 900 }}>
              Welcome back, {firstName}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", margin: "5px 0 0", fontSize: 14 }}>
              {stats.total === 0
                ? "Start your learning journey today."
                : `You have ${stats.total} course${stats.total !== 1 ? "s" : ""} in your library.`}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "-28px auto 0", padding: "0 24px" }}>

        {/* Stat Cards */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
          <StatCard label="Total Enrolled" value={stats.total}                                   accent={purple} />
          <StatCard label="In Progress"    value={stats.inProgress}                             accent="#f97316" />
          <StatCard label="Completed"      value={stats.completed}                              accent="#16a34a" />
          <StatCard label="Total Spent"    value={`$${(stats.totalSpent || 0).toFixed(2)}`}    accent="#0ea5e9" />
        </div>

        {/* Continue / Start Learning */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: purpleDark }}>
              {continueLearning?.length > 0 ? "Continue Learning" : "Start Learning"}
            </h2>
            <Link to="/my-learning" style={{ fontSize: 13, color: purple, fontWeight: 700, textDecoration: "none" }}>
              View all
            </Link>
          </div>

          {activeLearning?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activeLearning.map((e) => (
                <ContinueCard key={e._id} enrollment={e} />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "40px 24px",
                textAlign: "center",
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              }}
            >
              <h3 style={{ color: purpleDark, margin: "0 0 8px", fontSize: 17, fontWeight: 800 }}>No courses yet</h3>
              <p style={{ color: "#6b7280", margin: "0 0 20px", fontSize: 14 }}>
                Browse our catalog and enroll in your first course.
              </p>
              <Link
                to="/courses"
                style={{
                  background: purple, color: "#fff",
                  padding: "10px 28px", borderRadius: 10,
                  fontWeight: 700, textDecoration: "none", fontSize: 14,
                }}
              >
                Browse Courses
              </Link>
            </div>
          )}
        </section>

        {/* My Library */}
        {recentEnrollments?.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: purpleDark }}>My Library</h2>
              <Link to="/my-learning" style={{ fontSize: 13, color: purple, fontWeight: 700, textDecoration: "none" }}>
                View all
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {recentEnrollments.map((e) => (
                <CourseMinCard key={e._id} enrollment={e} />
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: purpleDark }}>Recommended for You</h2>
              <Link to="/courses" style={{ fontSize: 13, color: purple, fontWeight: 700, textDecoration: "none" }}>
                Browse all
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {recommendations.map((course) => (
                <RecommendedCourseCard key={course._id} course={course} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
