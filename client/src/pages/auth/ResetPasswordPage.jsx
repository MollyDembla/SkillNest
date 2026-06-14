import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);

  if (!token) {
    return (
      <AuthShell title="Invalid link" subtitle="This password reset link is missing or malformed.">
        <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
          <Link
            to="/auth/forgot-password"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#5f4999",
              color: "#fff",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Get a new reset link
          </Link>
        </div>
      </AuthShell>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError("Please enter a new password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(token, { password });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <Link to="/auth/login" style={{ color: "#5f4999", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
          Back to log in
        </Link>
      }
    >
      {success ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "16px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 4,
          }}>
            <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>✓</span>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#166534" }}>Password updated</p>
              <p style={{ margin: 0, fontSize: 13, color: "#15803d" }}>
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/auth/login")}
            style={{
              width: "100%",
              padding: "13px",
              background: "#5f4999",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Go to log in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1c1d1f" }}>
              New password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              style={inputStyle(focused === "password")}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#1c1d1f" }}>
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              style={inputStyle(focused === "confirm")}
              onFocus={() => setFocused("confirm")}
              onBlur={() => setFocused(null)}
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
              {error.includes("expired") && (
                <span>
                  {" "}
                  <Link to="/auth/forgot-password" style={{ color: "#dc2626", fontWeight: 700 }}>
                    Get a new link →
                  </Link>
                </span>
              )}
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
            {loading ? "Updating password…" : "Set new password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
