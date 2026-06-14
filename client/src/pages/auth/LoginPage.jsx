import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFeedback("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setFeedback("");

    try {
      const res = await login({ email, password });
      const role = res?.data?.user?.role || "student";
      // Redirect to page the user tried to visit, or role default
      const from = location.state?.from?.pathname || roleDestination[role] || "/courses";
      navigate(from, { replace: true });
    } catch (error) {
      setFeedback(
        error?.response?.data?.message || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Sign in to your SkillNest account to continue learning or managing your courses."
      footer={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link
            to="/auth/register"
            style={{ color: "#6d4ef5", fontWeight: 700, textDecoration: "none" }}
          >
            Create account
          </Link>
          <Link
            to="/auth/forgot-password"
            style={{ color: "#6d4ef5", fontWeight: 700, textDecoration: "none" }}
          >
            Forgot password?
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div>
          <label style={labelStyle}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            autoComplete="email"
          />
        </div>

        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            style={inputStyle}
            autoComplete="current-password"
          />
        </div>

        {feedback ? (
          <div
            style={{
              borderRadius: "18px",
              background: "#ffe2eb",
              padding: "12px 14px",
              fontSize: "14px",
              color: "#c0284d",
            }}
          >
            {feedback}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{ ...buttonStyle, opacity: loading ? 0.75 : 1 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
