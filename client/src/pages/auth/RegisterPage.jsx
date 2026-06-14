import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";

const inputStyle = {
  width: "100%",
  borderRadius: "18px",
  border: "1px solid #eadff8",
  background: "#fcfaff",
  padding: "14px 16px",
  fontSize: "15px",
  outline: "none",
  color: "#3d3666",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: 700,
  color: "#53467f",
};

const buttonStyle = {
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
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setFeedback({ type: "error", message: "Please fill in all fields." });
      return;
    }
    if (form.password.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      await register(form);
      setFeedback({
        type: "success",
        message: "Account created! Check your email to verify your account, then sign in.",
      });
      setForm({ name: "", email: "", password: "", role: "student" });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error?.response?.data?.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join SkillNest today"
      subtitle="Start learning or share your expertise — create your free account in seconds."
      footer={
        <Link
          to="/auth/login"
          style={{ color: "#6d4ef5", fontWeight: 700, textDecoration: "none" }}
        >
          Already have an account? Sign in
        </Link>
      }
    >
      {feedback.type === "success" ? (
        <div
          style={{
            borderRadius: "24px",
            background: "#e8f9ee",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              margin: "0 auto 16px",
              width: "56px",
              height: "56px",
              borderRadius: "9999px",
              background: "#dff8e7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 900,
              color: "#2a8d53",
            }}
          >
            ✓
          </div>
          <p style={{ margin: "0 0 20px", fontSize: "14px", lineHeight: 1.8, color: "#2a8d53" }}>
            {feedback.message}
          </p>
          <Link
            to="/auth/login"
            style={{
              display: "inline-flex",
              borderRadius: "999px",
              background: "#6d4ef5",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: 700,
              color: "white",
              textDecoration: "none",
            }}
          >
            Go to Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Your full name"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="At least 6 characters"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>I want to join as</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {["student", "instructor"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => updateField("role", role)}
                  style={{
                    border: "none",
                    borderRadius: "18px",
                    padding: "14px 16px",
                    fontSize: "14px",
                    fontWeight: 800,
                    textTransform: "capitalize",
                    cursor: "pointer",
                    background: form.role === role ? "#6d4ef5" : "#f4ebff",
                    color: form.role === role ? "white" : "#5d4e98",
                    transition: "background 0.15s",
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {feedback.message && feedback.type === "error" ? (
            <div
              style={{
                borderRadius: "18px",
                background: "#ffe2eb",
                padding: "12px 14px",
                fontSize: "14px",
                color: "#c0284d",
              }}
            >
              {feedback.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{ ...buttonStyle, opacity: loading ? 0.75 : 1 }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
