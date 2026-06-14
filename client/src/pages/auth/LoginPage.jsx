import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "../../components/auth/AuthShell";

const field = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const label = {
  fontSize: 13,
  fontWeight: 600,
  color: "#1c1d1f",
};

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
  transition: "border-color 0.15s",
  fontFamily: "inherit",
};

const roleDestination = {
  student: "/dashboard",
  instructor: "/instructor/dashboard",
  admin: "/admin/dashboard",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await login({ email, password });
      const role = res?.data?.user?.role || "student";
      const from = location.state?.from?.pathname || roleDestination[role] || "/courses";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Log in to your account"
      subtitle="Welcome back! Enter your credentials to continue."
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
          <Link to="/auth/register" style={{ color: "#5f4999", fontWeight: 600, textDecoration: "none" }}>
            New to SkillNest? Sign up
          </Link>
          <Link to="/auth/forgot-password" style={{ color: "#5f4999", fontWeight: 600, textDecoration: "none" }}>
            Forgot password?
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={field}>
          <label style={label}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            style={{ ...input, borderColor: focusedField === "email" ? "#5f4999" : "#d1d7dc" }}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />
        </div>

        <div style={field}>
          <label style={label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            style={{ ...input, borderColor: focusedField === "password" ? "#5f4999" : "#d1d7dc" }}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
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
            transition: "background 0.15s",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
