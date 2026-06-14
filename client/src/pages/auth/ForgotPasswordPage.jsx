import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authService from "../../services/authService";
import AuthShell from "../../components/auth/AuthShell";

const inputStyle = (focused) => ({
  width: "100%",
  padding: "11px 14px",
  border: `1.5px solid ${focused ? "#5f4999" : "#d1d7dc"}`,
  borderRadius: 4,
  fontSize: 15,
  color: "#1c1d1f",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { resetUrl, name }
  const [focused, setFocused] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await authService.forgotPassword({ email });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "No account found with that email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your registered email address to get a password reset link."
      footer={
        <Link to="/auth/login" style={{ color: "#5f4999", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
          Back to log in
        </Link>
      }
    >
      {result ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Identity confirmed */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 4,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>✓</span>
            <p style={{ margin: 0, fontSize: 14, color: "#166534", fontWeight: 600 }}>
              Account verified — here is your reset link, {result.name?.split(" ")[0]}.
            </p>
          </div>

          {/* Reset link box */}
          <div style={{
            padding: "16px",
            background: "#f7f9fa",
            border: "1px solid #d1d7dc",
            borderRadius: 4,
          }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#6a6f73", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Your password reset link
            </p>
            <p style={{
              margin: "0 0 14px",
              fontSize: 12,
              color: "#1c1d1f",
              wordBreak: "break-all",
              lineHeight: 1.6,
              fontFamily: "monospace",
              background: "#fff",
              padding: "10px 12px",
              border: "1px solid #e8e8e8",
              borderRadius: 4,
            }}>
              {result.resetUrl}
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => navigate(`/auth/reset-password?token=${result.resetUrl.split("token=")[1]}`)}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "#5f4999",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Reset my password →
              </button>
              <button
                onClick={handleCopy}
                style={{
                  padding: "11px 16px",
                  background: "#fff",
                  color: copied ? "#16a34a" : "#1c1d1f",
                  border: `1.5px solid ${copied ? "#bbf7d0" : "#d1d7dc"}`,
                  borderRadius: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  flexShrink: 0,
                  transition: "all 0.15s",
                }}
              >
                {copied ? "Copied ✓" : "Copy link"}
              </button>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 12, color: "#6a6f73", lineHeight: 1.5 }}>
            This link expires in <strong>10 minutes</strong>. Do not share it with anyone.
          </p>

          <button
            onClick={() => { setResult(null); setEmail(""); }}
            style={{
              background: "none",
              border: "none",
              color: "#5f4999",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1c1d1f" }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={inputStyle(focused)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>

          {error && (
            <div style={{
              padding: "12px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 4,
              fontSize: 14,
              color: "#dc2626",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: loading ? "#a89cc8" : "#5f4999",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Verifying…" : "Get reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
