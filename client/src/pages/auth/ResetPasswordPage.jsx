import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as authService from "../../services/authService";
import AuthShell from "../../components/auth/AuthShell";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFeedback("Passwords do not match.");
      return;
    }

    if (!token) {
      setFeedback("Reset token is missing.");
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      const res = await authService.resetPassword(token, { password });
      setFeedback(
        res.message || "Password reset successfully. You can sign in now.",
      );
    } catch (error) {
      setFeedback(
        error?.response?.data?.message || "Unable to reset password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Create a new password"
      subtitle="Use a strong password you haven’t used before."
      footer={
        <Link
          to="/auth/login"
          style={{ color: "#6d4ef5", fontWeight: 700, textDecoration: "none" }}
        >
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#53467f",
            }}
          >
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            style={{
              width: "100%",
              borderRadius: "18px",
              border: "1px solid #eadff8",
              background: "#fcfaff",
              padding: "14px 16px",
              fontSize: "15px",
              outline: "none",
              color: "#3d3666",
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#53467f",
            }}
          >
            Confirm password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            style={{
              width: "100%",
              borderRadius: "18px",
              border: "1px solid #eadff8",
              background: "#fcfaff",
              padding: "14px 16px",
              fontSize: "15px",
              outline: "none",
              color: "#3d3666",
            }}
          />
        </div>

        {feedback ? (
          <div
            style={{
              borderRadius: "18px",
              background: "#f4ebff",
              padding: "12px 14px",
              fontSize: "14px",
              color: "#5d4e98",
            }}
          >
            {feedback}
          </div>
        ) : null}

        <button
          disabled={loading}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "18px",
            padding: "14px 16px",
            fontSize: "15px",
            fontWeight: 800,
            background: "#6d4ef5",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 14px 28px rgba(109, 78, 245, 0.2)",
            opacity: loading ? 0.75 : 1,
          }}
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}
