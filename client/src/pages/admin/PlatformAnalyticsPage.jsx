import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/apiClient";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const purple      = "#5f4999";
const purpleDark  = "#3c3168";
const purpleLight = "#ede9f8";
const green       = "#16a34a";
const orange      = "#f97316";
const blue        = "#0ea5e9";

const PERIODS = [
  { value: 7,  label: "7 days"  },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

// ── helpers ─────────────────────────────────────────────────────
function fmtUSD(v) {
  return `$${(v || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
function fmtNum(v) {
  return (v || 0).toLocaleString("en-US");
}
function shortDate(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── KPI stat card ────────────────────────────────────────────────
function KpiCard({ label, value, color, sub }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "22px 24px",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f0edf8",
        borderTop: `3px solid ${color}`,
        flex: "1 1 0",
        minWidth: 160,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 900, color: purpleDark, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── section wrapper ──────────────────────────────────────────────
function Section({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "22px 24px",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f0edf8",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: purpleDark }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ── custom tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e9e4f7",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700, color: purpleDark, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
          <span style={{ color: "#6b7280" }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: purpleDark }}>
            {formatter ? formatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────
export default function PlatformAnalyticsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays]     = useState(30);

  useEffect(() => {
    setLoading(true);
    setData(null);
    (async () => {
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

  // Enrich time-series with formatted labels
  const enrollmentSeries = (data?.enrollmentsByDay || []).map((d) => ({
    ...d,
    label: shortDate(d.date),
  }));
  const revenueSeries = (data?.revenueByDay || []).map((d) => ({
    ...d,
    label: shortDate(d.date),
  }));

  // Top-courses bar data
  const topCoursesBar = (data?.topCourses || []).slice(0, 8).map((c) => ({
    name: c.title?.length > 22 ? c.title.slice(0, 20) + "…" : c.title,
    Reviews: c.reviewsCount || 0,
    Rating: parseFloat((c.averageRating || 0).toFixed(1)),
  }));

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)`, padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 6px" }}>
              <Link to="/admin/dashboard" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Admin</Link>
              {" › "}Analytics
            </p>
            <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: 0 }}>Platform Analytics</h1>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: "4px 0 0" }}>
              Real-time insights across users, courses, enrollments, and revenue
            </p>
          </div>

          {/* Period selector */}
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 4 }}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setDays(p.value)}
                style={{
                  padding: "7px 16px", borderRadius: 7, border: "none",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: days === p.value ? "#fff" : "transparent",
                  color: days === p.value ? purple : "rgba(255,255,255,0.85)",
                  transition: "all 0.15s",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 100 }}>
            <div style={{ width: 48, height: 48, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading analytics…</p>
          </div>
        ) : data ? (
          <>
            {/* KPI Row */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
              <KpiCard label="Total Users"       value={fmtNum(data.totalUsers)}       color={purple} sub="All registered accounts" />
              <KpiCard label="Published Courses" value={fmtNum(data.totalCourses)}     color={blue}   sub="Live on the platform" />
              <KpiCard label="Total Enrollments" value={fmtNum(data.totalEnrollments)} color={green}  sub="Active enrollments" />
              <KpiCard label="Total Revenue"     value={fmtUSD(data.totalRevenue)}     color={orange} sub="All-time net revenue" />
            </div>

            {/* Charts row 1 — Enrollments + Revenue */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

              {/* Enrollments over time */}
              <Section
                title={`Enrollments — Last ${days} days`}
                subtitle={`${enrollmentSeries.reduce((s, d) => s + d.count, 0)} total enrollments in period`}
              >
                {enrollmentSeries.length === 0 || enrollmentSeries.every((d) => d.count === 0) ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>No enrollment data for this period.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={enrollmentSeries} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={purple} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={purple} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f0fa" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Enrollments"
                        stroke={purple}
                        strokeWidth={2.5}
                        fill="url(#enrollGrad)"
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: purple }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Section>

              {/* Revenue over time */}
              <Section
                title={`Revenue — Last ${days} days`}
                subtitle={`${fmtUSD(revenueSeries.reduce((s, d) => s + d.amount, 0))} total in period`}
              >
                {revenueSeries.length === 0 || revenueSeries.every((d) => d.amount === 0) ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af", fontSize: 13 }}>No revenue data for this period.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={revenueSeries} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={green} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={green} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f0fa" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip content={<CustomTooltip formatter={fmtUSD} />} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        name="Revenue"
                        stroke={green}
                        strokeWidth={2.5}
                        fill="url(#revGrad)"
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: green }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            {/* Top Courses Bar Chart */}
            {topCoursesBar.length > 0 && (
              <Section
                title="Top Courses by Reviews"
                subtitle="Courses with the highest review counts on the platform"
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topCoursesBar} margin={{ top: 4, right: 8, left: -10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f0fa" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "#fff", border: "1px solid #e9e4f7", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13 }}>
                            <div style={{ fontWeight: 700, color: purpleDark, marginBottom: 6 }}>{label}</div>
                            {payload.map((p, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.fill, flexShrink: 0 }} />
                                <span style={{ color: "#6b7280" }}>{p.name}:</span>
                                <span style={{ fontWeight: 700, color: purpleDark }}>{p.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 8, fontSize: 12 }} />
                    <Bar dataKey="Reviews" fill={purple} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Table below chart */}
                <div style={{ marginTop: 20, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f3f0fa" }}>
                        {["#", "Course", "Instructor", "Rating", "Reviews", "Price"].map((h) => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(data.topCourses || []).map((c, i) => (
                        <tr key={c._id} style={{ borderBottom: "1px solid #f9f7ff" }}>
                          <td style={{ padding: "10px 12px", fontWeight: 800, color: i < 3 ? orange : "#9ca3af" }}>#{i + 1}</td>
                          <td style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                            {c.thumbnail && <img src={c.thumbnail} alt="" style={{ width: 40, height: 28, objectFit: "cover", borderRadius: 5, flexShrink: 0 }} />}
                            <span style={{ fontWeight: 700, color: purpleDark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>{c.title}</span>
                          </td>
                          <td style={{ padding: "10px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{c.instructor?.name || "—"}</td>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: orange, whiteSpace: "nowrap" }}>{c.averageRating?.toFixed(1) || "—"} / 5</td>
                          <td style={{ padding: "10px 12px", color: "#374151", whiteSpace: "nowrap" }}>{c.reviewsCount || 0}</td>
                          <td style={{ padding: "10px 12px", fontWeight: 700, color: purpleDark, whiteSpace: "nowrap" }}>{c.price === 0 ? "Free" : `$${c.price}`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
