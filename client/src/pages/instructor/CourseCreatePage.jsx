import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createCourse } from "../../services/courseService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

const CATEGORIES = [
  "Development", "Business", "Design", "Marketing",
  "Photography", "Music", "Health & Fitness", "Finance", "Other",
];
const LEVELS = [
  { value: "beginner",     label: "Beginner — no prior experience needed" },
  { value: "intermediate", label: "Intermediate — some background helpful" },
  { value: "advanced",     label: "Advanced — experienced learners" },
  { value: "all",          label: "All Levels — anyone can join" },
];

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e9e4f7",
  borderRadius: 10,
  fontSize: 14,
  color: "#1a1a2e",
  background: "#faf8ff",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};
const inputError = { ...inputStyle, borderColor: "#fca5a5", background: "#fff5f5" };
const labelStyle = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#53467f" };
const sectionCard = {
  background: "#fff",
  borderRadius: 16,
  padding: "24px 28px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  marginBottom: 20,
};
const sectionTitle = {
  margin: "0 0 20px",
  fontSize: 16,
  fontWeight: 800,
  color: "#1a1a2e",
  paddingBottom: 12,
  borderBottom: "1px solid #f3f0fa",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

function FieldError({ msg }) {
  if (!msg) return null;
  return <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4, fontWeight: 600 }}>⚠ {msg}</div>;
}

export default function CourseCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    level: "beginner",
    price: "",
    estimatedDuration: "",
    thumbnail: "",
    previewVideoUrl: "",
  });
  const [thumbError, setThumbError] = useState(false);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Course title is required.";
    else if (form.title.trim().length < 10) e.title = "Title must be at least 10 characters.";
    if (!form.description.trim()) e.description = "Course description is required.";
    else if (form.description.trim().length < 50) e.description = "Description must be at least 50 characters.";
    if (!form.category) e.category = "Please select a category.";
    if (form.price !== "" && (isNaN(Number(form.price)) || Number(form.price) < 0))
      e.price = "Enter a valid price (0 for free).";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix the errors below.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price === "" ? 0 : Number(form.price),
      };
      const res = await createCourse(payload);
      const newId = res.data?.course?._id;
      toast.success("Course created! Now add your lessons.");
      navigate(`/instructor/courses/${newId}/edit`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  const charCount = (val, max) => (
    <div style={{ fontSize: 11, color: val.length > max * 0.9 ? "#d97706" : "#9ca3af", textAlign: "right", marginTop: 4 }}>
      {val.length}/{max}
    </div>
  );

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>

      {/* ── Sticky header ── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "#fff", borderBottom: "1px solid #f3f0fa",
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/instructor/courses" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 600 }}>
            ← My Courses
          </Link>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>Create New Course</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/instructor/courses"
            style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", background: "#f3f4f6", color: "#6b7280" }}
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: "8px 24px", borderRadius: 10, fontSize: 13, fontWeight: 800,
              background: saving ? "#d1c4f7" : purple, color: "#fff",
              border: "none", cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Creating…" : "Create & Add Lessons →"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "32px auto 0", padding: "0 24px" }}>

        {/* Info callout */}
        <div
          style={{
            background: purpleLight, borderRadius: 12, padding: "14px 18px", marginBottom: 24,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontWeight: 700, color: purpleDark, fontSize: 13 }}>After creating the course</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              You'll be taken to the course editor where you can add lessons, a preview video, and thumbnail before submitting for review.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Basic Info ── */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}><span>📝</span> Basic Information</h2>
            <div style={{ display: "grid", gap: 18 }}>

              <div>
                <label style={labelStyle}>
                  Course Title <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  style={errors.title ? inputError : inputStyle}
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. The Complete JavaScript Bootcamp 2024"
                  maxLength={100}
                />
                {charCount(form.title, 100)}
                <FieldError msg={errors.title} />
              </div>

              <div>
                <label style={labelStyle}>
                  Subtitle <span style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af" }}>(optional)</span>
                </label>
                <input
                  style={inputStyle}
                  value={form.subtitle}
                  onChange={(e) => set("subtitle", e.target.value)}
                  placeholder="A compelling one-liner that appears under the title"
                  maxLength={200}
                />
                {charCount(form.subtitle, 200)}
              </div>

              <div>
                <label style={labelStyle}>
                  Description <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  style={{ ...(errors.description ? inputError : inputStyle), minHeight: 150, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="What will students learn? What topics are covered? Who is this course for? Minimum 50 characters."
                />
                {charCount(form.description, 2000)}
                <FieldError msg={errors.description} />
              </div>
            </div>
          </div>

          {/* ── Course Details ── */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}><span>🎓</span> Course Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

              <div>
                <label style={labelStyle}>
                  Category <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  style={errors.category ? inputError : inputStyle}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  <option value="">Select a category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.category} />
              </div>

              <div>
                <label style={labelStyle}>Level</label>
                <select style={inputStyle} value={form.level} onChange={(e) => set("level", e.target.value)}>
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Price (USD)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: 700, fontSize: 14 }}>
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    style={{ ...(errors.price ? inputError : inputStyle), paddingLeft: 28 }}
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Enter 0 for a free course</div>
                <FieldError msg={errors.price} />
              </div>

              <div>
                <label style={labelStyle}>Estimated Duration</label>
                <input
                  style={inputStyle}
                  value={form.estimatedDuration}
                  onChange={(e) => set("estimatedDuration", e.target.value)}
                  placeholder="e.g. 12 hours, 6 weeks"
                />
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Shown on the course detail page</div>
              </div>
            </div>
          </div>

          {/* ── Media ── */}
          <div style={sectionCard}>
            <h2 style={sectionTitle}><span>🖼️</span> Media</h2>
            <div style={{ display: "grid", gap: 22 }}>

              <div>
                <label style={labelStyle}>Thumbnail Image URL</label>
                <input
                  style={inputStyle}
                  value={form.thumbnail}
                  onChange={(e) => { set("thumbnail", e.target.value); setThumbError(false); }}
                  placeholder="https://example.com/course-thumbnail.jpg"
                />
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  Recommended: 1280×720 (16:9). You can also add this later in the course editor.
                </div>
                {form.thumbnail && (
                  <div style={{ marginTop: 12 }}>
                    {thumbError ? (
                      <div style={{ width: 240, height: 135, borderRadius: 10, background: "#f3f0fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9ca3af", border: "1px dashed #d1c4e9" }}>
                        Image not found
                      </div>
                    ) : (
                      <img
                        src={form.thumbnail}
                        alt="Thumbnail preview"
                        onError={() => setThumbError(true)}
                        style={{ width: 240, height: 135, objectFit: "cover", borderRadius: 10, border: "1px solid #e9e4f7" }}
                      />
                    )}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Preview Video URL</label>
                <input
                  style={inputStyle}
                  value={form.previewVideoUrl}
                  onChange={(e) => set("previewVideoUrl", e.target.value)}
                  placeholder="YouTube or Vimeo URL (e.g. https://youtu.be/...)"
                />
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  A 1–2 minute free preview shown to students before they enroll.
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom actions ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
            <Link
              to="/instructor/courses"
              style={{ padding: "11px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: "none", background: "#f3f4f6", color: "#6b7280" }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "11px 32px", borderRadius: 12, fontSize: 14, fontWeight: 800,
                background: saving ? "#d1c4f7" : `linear-gradient(135deg, #8b6ef5, ${purple})`,
                color: "#fff", border: "none", cursor: saving ? "not-allowed" : "pointer",
                boxShadow: saving ? "none" : "0 4px 14px rgba(95,73,153,0.35)",
              }}
            >
              {saving ? "Creating…" : "Create Course & Add Lessons →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
