import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/apiClient";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "22px 24px", boxShadow: "0 2px 12px rgba(95,73,153,0.07)", border: "1.5px solid #f0edf8" }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 30, fontWeight: 900, color: color || purpleDark, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, valueKey, labelKey, color, title, formatter }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d[valueKey] || 0));
  return (
    <div>
      <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800, color: purpleDark }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
        {data.map((d, i) => {
          const pct = max > 0 ? ((d[valueKey] || 0) / max) * 100 : 0;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
              <div
                title={`${d[labelKey]}: ${formatter ? formatter(d[valueKey]) : d[valueKey]}`}
                style={{ width: "100%", background: color || purple, borderRadius: "4px 4px 0 0", height: `${Math.max(pct, 2)}%`, transition: "height 0.3s", cursor: "default", minHeight: 2 }}
              />
              <span style={{ fontSize: 9, color: "#9ca3af", writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace: "nowrap", maxHeight: 40, overflow: "hidden" }}>
                {d[labelKey]?.slice(5) || d[labelKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PERIODS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export default function PlatformAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/analytics", { params: { days } });
        setData(res.data.data);
      } catch {
        toast.error("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5ff", paddingBottom: 60 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)`, padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 6px" }}>
              <Link to="/admin/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Admin</Link> › Analytics
            </p>
            <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: 0 }}>Platform Analytics</h1>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setDays(p.value)}
                style={{
                  padding: "8px 16px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: days === p.value ? "#fff" : "rgba(255,255,255,0.15)",
                  color: days === p.value ? purple : "#fff",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : data ? (
          <>
            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
              <StatCard icon="👥" label="Total Users" value={data.totalUsers?.toLocaleString()} />
              <StatCard icon="📚" label="Published Courses" value={data.totalCourses?.toLocaleString()} />
              <StatCard icon="🎓" label="Total Enrollments" value={data.totalEnrollments?.toLocaleString()} />
              <StatCard icon="💰" label="Total Revenue" value={`$${data.totalRevenue?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} color="#16a34a" />
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 12px rgba(95,73,153,0.07)", border: "1.5px solid #f0edf8" }}>
                <BarChart
                  data={data.enrollmentsByDay}
                  valueKey="count"
                  labelKey="date"
                  color={purple}
                  title={`Enrollments · Last ${days} days`}
                />
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 12px rgba(95,73,153,0.07)", border: "1.5px solid #f0edf8" }}>
                <BarChart
                  data={data.revenueByDay}
                  valueKey="amount"
                  labelKey="date"
                  color="#16a34a"
                  title={`Revenue · Last ${days} days`}
                  formatter={(v) => `$${v?.toFixed(2)}`}
                />
              </div>
            </div>

            {/* Top courses */}
            {data.topCourses?.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 12px rgba(95,73,153,0.07)", border: "1.5px solid #f0edf8" }}>
                <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800, color: purpleDark }}>Top Courses by Reviews</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.topCourses.map((course, i) => (
                    <div key={course._id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: i < data.topCourses.length - 1 ? "1px solid #f0edf8" : "none" }}>
                      <span style={{ fontSize: 18, fontWeight: 900, color: i < 3 ? "#f59e0b" : "#9ca3af", width: 28, textAlign: "center" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </span>
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt="" style={{ width: 48, height: 34, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {course.title}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{course.instructor?.name}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>⭐ {course.averageRating?.toFixed(1)}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{course.reviewsCount} reviews</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: purpleDark, width: 70, textAlign: "right", flexShrink: 0 }}>
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
