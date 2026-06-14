import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/apiClient";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

export default function CertificatePage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const certRef = useRef(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/enrollments/certificates/${courseId}`);
        setCertificate(res.data.data.certificate);
      } catch (err) {
        setError(err.response?.data?.message || "Certificate not found.");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5ff" }}>
      <div style={{ width: 48, height: 48, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5ff", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 56 }}>🎓</div>
      <h2 style={{ color: purpleDark, margin: 0 }}>Certificate Not Available</h2>
      <p style={{ color: "#9ca3af", fontSize: 14 }}>{error}</p>
      <Link to="/my-learning" style={{ color: purple, fontWeight: 700, textDecoration: "none" }}>← Back to My Learning</Link>
    </div>
  );

  const issueDate = new Date(certificate.issueDate).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5ff", padding: "40px 16px 80px" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media print {
          body > * { display: none !important; }
          #cert-printable { display: block !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
        }
      `}</style>

      {/* Actions */}
      <div style={{ maxWidth: 860, margin: "0 auto 24px", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/my-learning" style={{ color: purple, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>← My Learning</Link>
        <button
          onClick={handlePrint}
          style={{
            background: `linear-gradient(135deg, #8b6ef5, ${purple})`,
            color: "#fff", border: "none", borderRadius: 12,
            padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 6px 20px rgba(95,73,153,0.3)",
          }}
        >
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Certificate */}
      <div
        id="cert-printable"
        ref={certRef}
        style={{
          maxWidth: 860,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(95,73,153,0.18)",
          border: `3px solid ${purpleLight}`,
        }}
      >
        {/* Top banner */}
        <div style={{
          background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 50%, #8b6ef5 100%)`,
          padding: "40px 48px 32px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
          <h1 style={{ color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
            SkillNest · Certificate of Completion
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: "48px 64px", textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>
            This is to certify that
          </p>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: purpleDark, margin: "0 0 4px", fontFamily: "Georgia, serif" }}>
            {certificate.studentNameSnapshot}
          </h2>
          <div style={{ width: 80, height: 3, background: `linear-gradient(135deg, ${purple}, #8b6ef5)`, margin: "16px auto 24px", borderRadius: 2 }} />
          <p style={{ fontSize: 15, color: "#6b7280", margin: "0 0 8px" }}>has successfully completed</p>
          <h3 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a2e", margin: "0 0 32px", lineHeight: 1.3 }}>
            {certificate.courseNameSnapshot}
          </h3>

          {/* Meta */}
          <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap", marginBottom: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                Issue Date
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: purpleDark }}>{issueDate}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                Certificate ID
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", fontFamily: "monospace" }}>
                {certificate.certificateId}
              </div>
            </div>
          </div>

          {/* Signature line */}
          <div style={{ borderTop: `2px solid ${purpleLight}`, paddingTop: 28, display: "flex", justifyContent: "center", gap: 80 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontFamily: "Georgia, serif", fontStyle: "italic", color: purpleDark, marginBottom: 4 }}>
                SkillNest
              </div>
              <div style={{ width: 120, height: 1, background: "#d1d5db", margin: "0 auto 6px" }} />
              <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Platform
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div style={{ height: 8, background: `linear-gradient(90deg, ${purpleDark}, ${purple}, #8b6ef5)` }} />
      </div>

      {/* Share section */}
      <div style={{ maxWidth: 860, margin: "28px auto 0", textAlign: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: 13 }}>
          Certificate ID: <strong style={{ color: purpleDark, fontFamily: "monospace" }}>{certificate.certificateId}</strong>
        </p>
      </div>
    </div>
  );
}
