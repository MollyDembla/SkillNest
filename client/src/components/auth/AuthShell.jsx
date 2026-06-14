import React from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  "Access 200+ expert-led courses",
  "Learn at your own pace, on any device",
  "Earn certificates on completion",
  "AI-powered course recommendations",
  "Chat directly with your instructor",
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {/* Left panel — brand */}
      <div
        style={{
          background: "#1c1d1f",
          color: "#fff",
          padding: "60px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#fff",
            textDecoration: "none",
            letterSpacing: "-0.5px",
            marginBottom: 48,
            display: "inline-block",
          }}
        >
          SkillNest
        </Link>

        <h2
          style={{
            fontSize: 32,
            fontWeight: 900,
            margin: "0 0 16px",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
          }}
        >
          Start learning today.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", margin: "0 0 40px", lineHeight: 1.6 }}>
          Join thousands of students building in-demand skills on SkillNest.
        </p>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          {FEATURES.map((f) => (
            <li key={f} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#5f4999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  flexShrink: 0,
                  color: "#fff",
                }}
              >
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>

        <div
          style={{
            marginTop: 48,
            padding: "20px 24px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 8,
            borderLeft: "3px solid #5f4999",
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, fontStyle: "italic" }}>
            "SkillNest helped me land my first developer role in just 6 months. The courses are practical and the instructors are genuinely helpful."
          </p>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            — A SkillNest student
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 56px",
        }}
      >
        <div style={{ maxWidth: 400, width: "100%" }}>
          <Link
            to="/"
            style={{
              fontSize: 13,
              color: "#6a6f73",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 40,
              fontWeight: 500,
            }}
          >
            ← Back to home
          </Link>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#1c1d1f",
              margin: "0 0 6px",
              letterSpacing: "-0.3px",
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 14, color: "#6a6f73", margin: "0 0 28px", lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}

          {children}

          {footer && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid #e8e8e8",
                fontSize: 14,
                color: "#6a6f73",
                textAlign: "center",
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
