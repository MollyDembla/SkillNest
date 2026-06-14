import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as authService from "../../services/authService";
import AuthShell from "../../components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");

    try {
      const res = await authService.forgotPassword({ email });
      setFeedback(res.message || "Password reset email sent.");
    } catch (error) {
      setFeedback(
        error?.response?.data?.message || "Unable to send reset email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password recovery"
      title="Forgot your password?"
      subtitle="We’ll send a reset link to your email so you can get back into SkillNest quickly."
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
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
