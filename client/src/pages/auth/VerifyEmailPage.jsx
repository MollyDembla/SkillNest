import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import * as authService from "../../services/authService";
import AuthShell from "../../components/auth/AuthShell";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Email verified successfully. You can now sign in.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error?.response?.data?.message ||
            "Verification failed or token expired.",
        );
      }
    };

    verify();
  }, [token]);

  return (
    <AuthShell
      eyebrow="Email verification"
      title="Verify your account"
      subtitle="Confirm your email address to activate access to SkillNest features."
      footer={
        <Link
          to="/auth/login"
          style={{ color: "#6d4ef5", fontWeight: 700, textDecoration: "none" }}
        >
          Back to sign in
        </Link>
      }
    >
      <div
        style={{
          borderRadius: "24px",
          background: "#f8f2ff",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            margin: "0 auto 16px",
            display: "flex",
            height: "64px",
            width: "64px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "9999px",
            fontSize: "24px",
            fontWeight: 900,
            background:
              status === "success"
                ? "#dff8e7"
                : status === "error"
                  ? "#ffe2eb"
                  : "#fff",
            color:
              status === "success"
                ? "#2a8d53"
                : status === "error"
                  ? "#d64b72"
                  : "#6d4ef5",
          }}
        >
          {status === "success" ? "✓" : status === "error" ? "!" : "…"}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            lineHeight: 1.8,
            color: "#5b527d",
          }}
        >
          {message}
        </p>
        {status === "success" ? (
          <Link
            to="/auth/login"
            style={{
              display: "inline-flex",
              marginTop: "24px",
              borderRadius: "999px",
              background: "#6d4ef5",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: "white",
              textDecoration: "none",
            }}
          >
            Sign in now
          </Link>
        ) : null}
      </div>
    </AuthShell>
  );
}
