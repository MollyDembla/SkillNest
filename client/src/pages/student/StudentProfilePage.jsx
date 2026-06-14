import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/apiClient";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "28px 28px", marginBottom: 20, boxShadow: "0 2px 12px rgba(95,73,153,0.07)" }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 800, color: purpleDark }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px", border: "1.5px solid #e9e4f7",
  borderRadius: 12, fontSize: 14, color: "#1a1a2e", background: "#faf8ff",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

export default function StudentProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", bio: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    if (user) setForm({ name: user.name || "", bio: user.bio || "" });
    api.get("/enrollments/certificates")
      .then((res) => setCertificates(res.data.data?.certificates || []))
      .catch(() => {});
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required.");
    setSaving(true);
    try {
      const res = await api.put("/users/profile", { name: form.name.trim(), bio: form.bio.trim() });
      const updated = res.data.data?.user;
      if (updated && setUser) setUser(updated);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return toast.error("Passwords do not match.");
    if (passwords.newPassword.length < 6) return toast.error("New password must be at least 6 characters.");
    setChangingPw(true);
    try {
      await api.put("/users/password", { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success("Password changed!");
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPw(false);
    }
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5ff", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)`, padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)",
              border: "none", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.8)",
              fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 20, transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", flexShrink: 0, overflow: "hidden", border: "3px solid rgba(255,255,255,0.4)" }}>
            {form.avatar ? <img src={form.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
          </div>
          <div>
            <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 900, margin: 0 }}>{user?.name}</h1>
            <p style={{ color: "rgba(255,255,255,0.7)", margin: "4px 0 0", fontSize: 14 }}>{user?.email}</p>
          </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px" }}>
        {/* Profile form */}
        <Section title="Personal Information">
          <form onSubmit={handleSave}>
            <Field label="Full Name">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Bio">
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                placeholder="Tell us about yourself…"
              />
            </Field>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: `linear-gradient(135deg, #8b6ef5, ${purple})`,
                color: "#fff", border: "none", borderRadius: 12,
                padding: "11px 28px", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1, boxShadow: "0 6px 20px rgba(95,73,153,0.25)",
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </Section>

        {/* Password */}
        <Section title="Change Password">
          <form onSubmit={handlePasswordChange}>
            <Field label="Current Password">
              <input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                style={inputStyle}
                placeholder="Current password"
              />
            </Field>
            <Field label="New Password">
              <input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                style={inputStyle}
                placeholder="Min 6 characters"
              />
            </Field>
            <Field label="Confirm New Password">
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                style={inputStyle}
                placeholder="Repeat new password"
              />
            </Field>
            <button
              type="submit"
              disabled={changingPw}
              style={{
                background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 12,
                padding: "11px 28px", fontWeight: 800, fontSize: 14, cursor: changingPw ? "not-allowed" : "pointer",
                opacity: changingPw ? 0.7 : 1,
              }}
            >
              {changingPw ? "Updating…" : "Update Password"}
            </button>
          </form>
        </Section>

        {/* Certificates */}
        {certificates.length > 0 && (
          <Section title={`My Certificates (${certificates.length})`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {certificates.map((cert) => (
                <div key={cert._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: purpleLight, borderRadius: 14, border: `1.5px solid ${purple}22` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "#fff", color: purple, flexShrink: 0, boxShadow: "0 2px 8px rgba(95,73,153,0.06)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: purpleDark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cert.courseNameSnapshot}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                      Issued {new Date(cert.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <Link
                    to={`/certificate/${cert.course?._id || cert.course}`}
                    style={{ color: purple, fontWeight: 700, fontSize: 13, textDecoration: "none", padding: "6px 14px", background: "#fff", borderRadius: 10, border: `1.5px solid ${purple}` }}
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
