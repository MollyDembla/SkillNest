import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";

const field = { display: "flex", flexDirection: "column", gap: 6 };
const label = { fontSize: 13, fontWeight: 600, color: "#1c1d1f" };
const input = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #d1d7dc",
  borderRadius: 4,
  fontSize: 15,
  color: "#1c1d1f",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");
    try {
      await register(form);
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    ...input,
    borderColor: focused === name ? "#5f4999" : "#d1d7dc",
    transition: "border-color 0.15s",
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start learning or share your expertise — it's free."
      footer={
        <Link to="/auth/login" style={{ color: "#5f4999", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
          Already have an account? Log in
        </Link>
      }
    >
      {success ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%", background: "#dcfce7",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "#16a34a", margin: "0 auto 16px",
          }}>
            ✓
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1c1d1f" }}>
            Account created!
          </h3>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6a6f73", lineHeight: 1.6 }}>
            Check your email to verify your account, then log in.
          </p>
          <Link
            to="/auth/login"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#5f4999",
              color: "#fff",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Go to Log in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={field}>
            <label style={label}>Full name</label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your full name"
              style={inputStyle("name")}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div style={field}>
            <label style={label}>Email address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={inputStyle("email")}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div style={field}>
            <label style={label}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="At least 6 characters"
              style={inputStyle("password")}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
            />
          </div>

          <div style={field}>
            <label style={label}>I want to join as</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {["student", "instructor"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => update("role", role)}
                  style={{
                    padding: "11px",
                    borderRadius: 4,
                    border: `2px solid ${form.role === role ? "#5f4999" : "#d1d7dc"}`,
                    background: form.role === role ? "#5f4999" : "#fff",
                    color: form.role === role ? "#fff" : "#1c1d1f",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {role === "student" ? "📖 Student" : "🎓 Instructor"}
                </button>
              ))}
            </div>
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
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p style={{ margin: 0, fontSize: 12, color: "#6a6f73", textAlign: "center", lineHeight: 1.5 }}>
            By creating an account, you agree to our Terms of Service.
          </p>
        </form>
      )}
    </AuthShell>
  );
}
