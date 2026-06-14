import React from "react";
import { Link } from "react-router-dom";

export default function AuthLandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f7f1fb",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "520px", textAlign: "center" }}>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#c27fb6",
          }}
        >
          SkillNest
        </p>
        <h1
          style={{
            margin: "12px 0 0",
            fontSize: "36px",
            lineHeight: 1.1,
            fontWeight: 900,
            color: "#433777",
          }}
        >
          Sign in or create an account
        </h1>
        <p style={{ margin: "12px 0 0", color: "#6d658e", lineHeight: 1.8 }}>
          Use the buttons below to continue.
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginTop: "24px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/auth/login"
            style={{
              borderRadius: "999px",
              background: "#6d4ef5",
              color: "white",
              padding: "12px 18px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Sign in
          </Link>
          <Link
            to="/auth/register"
            style={{
              borderRadius: "999px",
              background: "white",
              color: "#5d4e98",
              padding: "12px 18px",
              textDecoration: "none",
              fontWeight: 700,
              boxShadow: "0 10px 24px rgba(95,73,153,0.08)",
            }}
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
