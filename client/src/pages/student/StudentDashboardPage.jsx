import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboard } from "../../services/studentService";
import { getRecommendations } from "../../services/aiService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

function StatCard({ label, value, icon, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "24px 28px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flex: "1 1 0",
        minWidth: 160,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: color + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4, fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ background: "#e9e4f7", borderRadius: 99, height: 6, overflow: "hidden" }}>
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

function ContinueCard({ enrollment }) {
  const course = enrollment.course;
  if (!course) return null;
  const pct = enrollment.progressPercentage || 0;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 80,
          height: 56,
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
          background: "#e9e4f7",
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
              fontSize: 22,
            }}
          >
            📚
          </div>
        )}
      </div>

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
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          {course.instructor?.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <ProgressBar pct={pct} />
          </div>
          <span style={{ fontSize: 11, color: purple, fontWeight: 700, flexShrink: 0 }}>
            {pct}%
          </span>
        </div>
      </div>

      <Link
        to={`/learn/${course._id}`}
        style={{
          background: purple,
          color: "#fff",
          borderRadius: 10,
          padding: "8px 18px",
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {pct === 0 ? "Start" : "Continue"} →
      </Link>
    </div>
  );
}

function CourseMinCard({ enrollment }) {
  const course = enrollment.course;
  if (!course) return null;
  const isCompleted =
    enrollment.status === "completed" || enrollment.progressPercentage >= 100;

  return (
    <Link to={`/learn/${course._id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <div style={{ height: 110, background: "#e9e4f7", position: "relative", overflow: "hidden" }}>
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
                fontSize: 36,
              }}
            >
              📚
            </div>
          )}
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
          <div
            style={{
              fontWeight: 700,
              color: "#1a1a2e",
              fontSize: 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {course.title}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>
            {course.instructor?.name}
          </div>
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

function RecommendedCourseCard({ course }) {
  return (
    <Link to={`/courses/${course.slug || course._id}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transition: "transform 0.15s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <div style={{ height: 110, background: "#e9e4f7", overflow: "hidden", flexShrink: 0 }}>
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
                fontSize: 36,
              }}
            >
              🤖
            </div>
          )}
        </div>
        <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontWeight: 700,
              color: "#1a1a2e",
              fontSize: 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: 4,
            }}
          >
            {course.title}
          </div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{course.instructor?.name}</div>
          <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: purple, fontWeight: 700 }}>
              {course.averageRating ? `⭐ ${course.averageRating.toFixed(1)}` : "New"}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

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
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2 style={{ color: "#1a1a2e", marginTop: 12 }}>Something went wrong</h2>
        <p style={{ color: "#6b7280" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16,
            background: purple,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 24px",
            fontWeight: 700,
            cursor: "pointer",
          }}
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
            {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div>
            <h1 style={{ color: "#fff", margin: 0, fontSize: 28, fontWeight: 800 }}>
              Welcome back, {firstName}! 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", margin: "6px 0 0", fontSize: 15 }}>
              {stats.total === 0
                ? "Start your learning journey today."
                : `You have ${stats.total} course${stats.total !== 1 ? "s" : ""} in your library.`}
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "-32px auto 0", padding: "0 24px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
          <StatCard label="Total Enrolled" value={stats.total} icon="📚" color={purple} />
          <StatCard label="In Progress" value={stats.inProgress} icon="🔥" color="#f97316" />
          <StatCard label="Completed" value={stats.completed} icon="✅" color="#16a34a" />
          <StatCard
            label="Total Spent"
            value={`$${(stats.totalSpent || 0).toFixed(2)}`}
            icon="💳"
            color="#0ea5e9"
          />
        </div>

        {/* Continue / Start Learning */}
        <section style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>
              {continueLearning?.length > 0 ? "Continue Learning" : "Start Learning"}
            </h2>
            <Link
              to="/my-learning"
              style={{ fontSize: 13, color: purple, fontWeight: 700, textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>

          {activeLearning?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {activeLearning.map((e) => (
                <ContinueCard key={e._id} enrollment={e} />
              ))}
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "40px 24px",
                textAlign: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
              <h3 style={{ color: "#1a1a2e", margin: "0 0 8px" }}>No courses yet</h3>
              <p style={{ color: "#6b7280", margin: "0 0 20px", fontSize: 14 }}>
                Browse our catalog and enroll in your first course.
              </p>
              <Link
                to="/courses"
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
                Browse Courses
              </Link>
            </div>
          )}
        </section>

        {/* My Library */}
        {recentEnrollments?.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>
                My Library
              </h2>
              <Link
                to="/my-learning"
                style={{ fontSize: 13, color: purple, fontWeight: 700, textDecoration: "none" }}
              >
                View all →
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {recentEnrollments.map((e) => (
                <CourseMinCard key={e._id} enrollment={e} />
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>
                🤖 Recommended for You
              </h2>
              <Link
                to="/courses"
                style={{ fontSize: 13, color: purple, fontWeight: 700, textDecoration: "none" }}
              >
                Browse all →
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {recommendations.map((course) => (
                <RecommendedCourseCard key={course._id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>
            Quick Actions
          </h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { to: "/courses", label: "🔍 Browse Courses" },
              { to: "/my-learning", label: "📖 My Learning" },
              { to: "/wishlist", label: "❤️ Wishlist" },
              { to: "/cart", label: "🛒 Cart" },
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
