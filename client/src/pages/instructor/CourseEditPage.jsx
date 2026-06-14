import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getInstructorCourse } from "../../services/instructorService";
import { updateCourse } from "../../services/courseService";
import { addLesson, updateLesson, deleteLesson } from "../../services/lessonService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";
const green = "#16a34a";

const CATEGORIES = [
  "Development", "Business", "Design", "Marketing",
  "Photography", "Music", "Health & Fitness", "Finance", "Other",
];
const LEVELS = [
  { value: "beginner",     label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced",     label: "Advanced" },
  { value: "all",          label: "All Levels" },
];
const STATUS_CONFIG = {
  draft:     { bg: "#f3f4f6", color: "#6b7280",  label: "Draft",          icon: "📝" },
  pending:   { bg: "#fef3c7", color: "#d97706",  label: "Pending Review", icon: "⏳" },
  published: { bg: "#dcfce7", color: "#16a34a",  label: "Published",      icon: "✅" },
  rejected:  { bg: "#fee2e2", color: "#dc2626",  label: "Rejected",       icon: "❌" },
};

const inputStyle = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid #e9e4f7", borderRadius: 10,
  fontSize: 14, color: "#1a1a2e", background: "#faf8ff",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const labelStyle = { display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700, color: "#53467f" };
const sectionCard = {
  background: "#fff", borderRadius: 16,
  padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  marginBottom: 20,
};
const sectionTitle = {
  margin: "0 0 20px", fontSize: 16, fontWeight: 800, color: "#1a1a2e",
  paddingBottom: 12, borderBottom: "1px solid #f3f0fa",
  display: "flex", alignItems: "center", gap: 8,
};

// ─── helpers ──────────────────────────────────────────────────
function secToMin(s) { return s ? parseFloat((s / 60).toFixed(1)) : ""; }
function minToSec(m) { return Math.round(parseFloat(m || 0) * 60); }
function displayDuration(sec) {
  const total = sec || 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.round(total % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function totalDuration(lessons) {
  return lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0);
}

// ─── LessonRow ─────────────────────────────────────────────────
function LessonRow({ lesson, index, total, expanded, onExpand, onSave, onDelete, onMoveUp, onMoveDown, saving, deleting }) {
  const [form, setForm] = useState({
    title: lesson.title || "",
    description: lesson.description || "",
    videoUrl: lesson.videoUrl || "",
    durationMin: secToMin(lesson.videoDuration),
    isPreview: lesson.isPreview || false,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setForm({
      title: lesson.title || "",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      durationMin: secToMin(lesson.videoDuration),
      isPreview: lesson.isPreview || false,
    });
  }, [lesson]);

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Lesson title is required."); return; }
    onSave(lesson._id, {
      title: form.title.trim(),
      description: form.description,
      videoUrl: form.videoUrl,
      videoDuration: minToSec(form.durationMin),
      isPreview: form.isPreview,
    });
  };

  return (
    <div style={{ borderBottom: "1px solid #f3f0fa" }}>
      {/* Header row */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "13px 16px", cursor: "pointer",
          background: expanded ? "#faf8ff" : "transparent",
          transition: "background 0.1s",
        }}
        onClick={() => onExpand(expanded ? null : lesson._id)}
      >
        {/* Reorder buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            title="Move up"
            style={{
              width: 20, height: 18, border: "none", borderRadius: 4,
              background: index === 0 ? "#f3f0fa" : purpleLight,
              color: index === 0 ? "#d1c4e9" : purple,
              cursor: index === 0 ? "default" : "pointer",
              fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
            }}
          >
            ▲
          </button>
          <button
            disabled={index === total - 1}
            onClick={() => onMoveDown(index)}
            title="Move down"
            style={{
              width: 20, height: 18, border: "none", borderRadius: 4,
              background: index === total - 1 ? "#f3f0fa" : purpleLight,
              color: index === total - 1 ? "#d1c4e9" : purple,
              cursor: index === total - 1 ? "default" : "pointer",
              fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
            }}
          >
            ▼
          </button>
        </div>

        {/* Order badge */}
        <div
          style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: expanded ? purple : "#e9e4f7",
            color: expanded ? "#fff" : purple,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800,
          }}
        >
          {index + 1}
        </div>

        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700, color: "#1a1a2e", fontSize: 14,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {lesson.title || <span style={{ color: "#9ca3af", fontWeight: 500 }}>Untitled lesson</span>}
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {lesson.videoDuration > 0 && (
            <span style={{ fontSize: 12, color: "#6b7280" }}>{displayDuration(lesson.videoDuration)}</span>
          )}
          {lesson.isPreview && (
            <span style={{ fontSize: 10, fontWeight: 700, background: purpleLight, color: purple, padding: "2px 8px", borderRadius: 99 }}>
              Preview
            </span>
          )}
          {lesson.videoUrl ? (
            <span style={{ fontSize: 12, color: green }}>🎬</span>
          ) : (
            <span style={{ fontSize: 12, color: "#d1d5db" }}>🎬</span>
          )}
          <span style={{ fontSize: 16, color: "#9ca3af", userSelect: "none" }}>
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Inline editor */}
      {expanded && (
        <div style={{ padding: "0 20px 20px", background: "#faf8ff", borderTop: "1px solid #f3f0fa" }}>
          <div style={{ paddingTop: 16, display: "grid", gap: 14 }}>

            <div>
              <label style={labelStyle}>Lesson Title *</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Introduction to Variables"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What does this lesson cover?"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Video URL</label>
                <input
                  style={inputStyle}
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="YouTube, Vimeo, or direct URL"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <label style={labelStyle}>Duration (minutes)</label>
                <input
                  type="number" min={0} step={0.5}
                  style={inputStyle}
                  value={form.durationMin}
                  onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <label
              style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={form.isPreview}
                onChange={(e) => setForm((f) => ({ ...f, isPreview: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: purple }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Free preview lesson</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Students can watch this before enrolling</div>
              </div>
            </label>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div>
                {!confirmDelete ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                    style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    🗑️ Delete
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#dc2626", fontWeight: 700 }}>Delete this lesson?</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                      style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      No
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(lesson._id); }}
                      disabled={deleting}
                      style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      {deleting ? "Deleting…" : "Yes, Delete"}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onExpand(null); }}
                  style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSave(); }}
                  disabled={saving}
                  style={{ background: saving ? "#d1c4f7" : purple, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Saving…" : "Save Lesson"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AddLessonForm ────────────────────────────────────────────
const EMPTY_LESSON = { title: "", description: "", videoUrl: "", durationMin: "", isPreview: false };

function AddLessonForm({ courseId, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY_LESSON);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Lesson title is required."); return; }
    setSaving(true);
    try {
      const res = await addLesson(courseId, {
        title: form.title.trim(),
        description: form.description,
        videoUrl: form.videoUrl,
        videoDuration: minToSec(form.durationMin),
        isPreview: form.isPreview,
      });
      toast.success("Lesson added.");
      onSaved(res.data.lesson);
      setForm(EMPTY_LESSON);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add lesson.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20, background: "#faf8ff", borderTop: "2px dashed #e9e4f7" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>New Lesson</h4>
        <button
          onClick={onCancel}
          style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={labelStyle}>Lesson Title *</label>
          <input
            ref={titleRef}
            style={inputStyle}
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Introduction to the Course"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }}
          />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of this lesson"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Video URL</label>
            <input
              style={inputStyle}
              value={form.videoUrl}
              onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
              placeholder="YouTube or Vimeo URL"
            />
          </div>
          <div>
            <label style={labelStyle}>Duration (minutes)</label>
            <input
              type="number" min={0} step={0.5}
              style={inputStyle}
              value={form.durationMin}
              onChange={(e) => setForm((f) => ({ ...f, durationMin: e.target.value }))}
              placeholder="e.g. 12.5"
            />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={form.isPreview}
            onChange={(e) => setForm((f) => ({ ...f, isPreview: e.target.checked }))}
            style={{ width: 16, height: 16, accentColor: purple }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Make this a free preview lesson</span>
        </label>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: saving ? "#d1c4f7" : purple, color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Adding…" : "Add Lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function CourseEditPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonSaving, setLessonSaving] = useState(null);
  const [lessonDeleting, setLessonDeleting] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [courseStatus, setCourseStatus] = useState("draft");
  const [rejectionReason, setRejectionReason] = useState("");
  const [dirty, setDirty] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const [form, setForm] = useState({
    title: "", subtitle: "", description: "", category: "",
    level: "beginner", price: 0, estimatedDuration: "", thumbnail: "", previewVideoUrl: "",
  });
  const originalForm = useRef(null);

  useEffect(() => {
    getInstructorCourse(courseId)
      .then((res) => {
        const { course, lessons: ls } = res.data;
        const loaded = {
          title:            course.title || "",
          subtitle:         course.subtitle || "",
          description:      course.description || "",
          category:         course.category || "",
          level:            course.level || "beginner",
          price:            course.price ?? 0,
          estimatedDuration: course.estimatedDuration || "",
          thumbnail:        course.thumbnail || "",
          previewVideoUrl:  course.previewVideoUrl || "",
        };
        setForm(loaded);
        originalForm.current = loaded;
        setCourseStatus(course.status || "draft");
        setRejectionReason(course.rejectionReason || "");
        setLessons(ls || []);
      })
      .catch(() => {
        toast.error("Could not load course. You may not have access.");
        navigate("/instructor/courses");
      })
      .finally(() => setPageLoading(false));
  }, [courseId]);

  const set = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      const orig = originalForm.current;
      setDirty(orig ? Object.keys(next).some((k) => String(next[k]) !== String(orig[k])) : true);
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Course title is required."); return; }
    if (!form.description.trim()) { toast.error("Description is required."); return; }
    if (!form.category) { toast.error("Please select a category."); return; }

    setSaving(true);
    try {
      await updateCourse(courseId, { ...form, price: Number(form.price) });
      originalForm.current = { ...form };
      setDirty(false);
      toast.success("Changes saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      toast.error("Please complete title, description, and category before submitting.");
      return;
    }
    if (lessons.length === 0) {
      toast.error("Add at least one lesson before submitting for review.");
      return;
    }
    if (dirty) {
      toast.error("You have unsaved changes. Save the course first.");
      return;
    }
    setSaving(true);
    try {
      await updateCourse(courseId, { status: "pending" });
      setCourseStatus("pending");
      toast.success("Submitted for review! An admin will review your course.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit.");
    } finally {
      setSaving(false);
    }
  };

  // ── Lesson reordering ──────────────────────────────────────
  const swapLessons = async (indexA, indexB) => {
    if (reordering) return;
    setReordering(true);
    try {
      const next = [...lessons];
      // Swap local order values
      const orderA = next[indexA].order;
      const orderB = next[indexB].order;

      await Promise.all([
        updateLesson(next[indexA]._id, { order: orderB }),
        updateLesson(next[indexB]._id, { order: orderA }),
      ]);

      // Swap in state
      const tmp = { ...next[indexA], order: orderB };
      next[indexA] = { ...next[indexB], order: orderA };
      next[indexB] = tmp;
      setLessons(next);
    } catch {
      toast.error("Failed to reorder lessons.");
    } finally {
      setReordering(false);
    }
  };

  const handleLessonSave = async (lessonId, data) => {
    setLessonSaving(lessonId);
    try {
      const res = await updateLesson(lessonId, data);
      setLessons((prev) => prev.map((l) => (l._id === lessonId ? res.data.lesson : l)));
      toast.success("Lesson saved.");
      setExpandedLesson(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save lesson.");
    } finally {
      setLessonSaving(null);
    }
  };

  const handleLessonDelete = async (lessonId) => {
    setLessonDeleting(lessonId);
    try {
      await deleteLesson(lessonId);
      setLessons((prev) => prev.filter((l) => l._id !== lessonId));
      setExpandedLesson(null);
      toast.success("Lesson deleted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete lesson.");
    } finally {
      setLessonDeleting(null);
    }
  };

  const handleLessonAdded = (newLesson) => {
    setLessons((prev) => [...prev, newLesson]);
    setShowAddForm(false);
  };

  const badge = STATUS_CONFIG[courseStatus] || STATUS_CONFIG.draft;
  const totalSec = totalDuration(lessons);

  // ── Loading ────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#9b8ec4", margin: 0 }}>Loading course editor…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Sticky header ── */}
      <div
        style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "#fff", borderBottom: "1px solid #f3f0fa",
          padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Link to="/instructor/courses" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
            ← My Courses
          </Link>
          <span style={{ color: "#d1d5db", flexShrink: 0 }}>|</span>
          <span
            style={{
              background: badge.bg, color: badge.color,
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, flexShrink: 0,
            }}
          >
            {badge.icon} {badge.label}
          </span>
          {dirty && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "3px 10px", borderRadius: 99, flexShrink: 0 }}>
              Unsaved changes
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          {courseStatus === "draft" && (
            <button
              onClick={handleSubmitForReview}
              disabled={saving}
              style={{
                padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                border: `1.5px solid ${purple}`, background: "transparent", color: purple,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              📤 Submit for Review
            </button>
          )}
          {courseStatus === "published" && (
            <Link
              to={`/courses/${courseId}`}
              target="_blank"
              style={{ padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "#dcfce7", color: green, textDecoration: "none" }}
            >
              👁️ View Course
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 24px", borderRadius: 10, fontSize: 13, fontWeight: 800,
              background: saving ? "#d1c4f7" : purple, color: "#fff",
              border: "none", cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : dirty ? "Save Changes ●" : "Save Changes"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "28px auto 0", padding: "0 24px" }}>

        {/* ── Rejection banner ── */}
        {courseStatus === "rejected" && (
          <div
            style={{
              background: "#fee2e2", borderRadius: 14, padding: "16px 20px",
              marginBottom: 20, display: "flex", gap: 12,
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 800, color: "#dc2626", fontSize: 14, marginBottom: 4 }}>
                Course Rejected by Admin
              </div>
              <div style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.6 }}>
                {rejectionReason || "No reason provided. Please contact support."}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
                Fix the issues above, then save and resubmit for review.
              </div>
            </div>
          </div>
        )}

        {/* ── Pending notice ── */}
        {courseStatus === "pending" && (
          <div
            style={{
              background: "#fefce8", borderRadius: 14, padding: "14px 20px",
              marginBottom: 20, display: "flex", gap: 12, alignItems: "center",
            }}
          >
            <span style={{ fontSize: 20 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: "#92400e", fontSize: 13 }}>Under Admin Review</div>
              <div style={{ fontSize: 12, color: "#a16207", marginTop: 2 }}>
                Your course is being reviewed. You can still edit it, but resubmission will be required after making changes.
              </div>
            </div>
          </div>
        )}

        {/* ── Basic Info ── */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}><span>📝</span> Basic Information</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label style={labelStyle}>Course Title <span style={{ color: "#dc2626" }}>*</span></label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. The Complete JavaScript Bootcamp"
                maxLength={100}
              />
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, textAlign: "right" }}>{form.title.length}/100</div>
            </div>
            <div>
              <label style={labelStyle}>Subtitle</label>
              <input
                style={inputStyle}
                value={form.subtitle}
                onChange={(e) => set("subtitle", e.target.value)}
                placeholder="A short tagline for your course"
                maxLength={200}
              />
            </div>
            <div>
              <label style={labelStyle}>Description <span style={{ color: "#dc2626" }}>*</span></label>
              <textarea
                style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What will students learn? What topics are covered?"
              />
            </div>
          </div>
        </div>

        {/* ── Course Details ── */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}><span>🎓</span> Course Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Category <span style={{ color: "#dc2626" }}>*</span></label>
              <select style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
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
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontWeight: 700, fontSize: 14 }}>$</span>
                <input
                  type="number" min={0} step={0.01}
                  style={{ ...inputStyle, paddingLeft: 28 }}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Enter 0 for a free course</div>
            </div>
            <div>
              <label style={labelStyle}>Estimated Duration</label>
              <input
                style={inputStyle}
                value={form.estimatedDuration}
                onChange={(e) => set("estimatedDuration", e.target.value)}
                placeholder="e.g. 12 hours, 4 weeks"
              />
            </div>
          </div>
        </div>

        {/* ── Media ── */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}><span>🖼️</span> Media</h2>
          <div style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={labelStyle}>Thumbnail Image URL</label>
              <input
                style={inputStyle}
                value={form.thumbnail}
                onChange={(e) => { set("thumbnail", e.target.value); setThumbError(false); }}
                placeholder="https://example.com/thumbnail.jpg"
              />
              {form.thumbnail && (
                <div style={{ marginTop: 12 }}>
                  {thumbError ? (
                    <div style={{ width: 240, height: 135, borderRadius: 10, background: "#f3f0fa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#9ca3af", border: "1px dashed #d1c4e9" }}>
                      Image not found
                    </div>
                  ) : (
                    <img
                      src={form.thumbnail}
                      alt="Thumbnail"
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
                placeholder="YouTube or Vimeo URL"
              />
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                A short free preview shown to students before they enroll.
              </div>
            </div>
          </div>
        </div>

        {/* ── Curriculum ── */}
        <div style={{ ...sectionCard, padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid #f3f0fa",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1a1a2e" }}>Curriculum</h2>
              <div style={{ marginTop: 4, display: "flex", gap: 14, fontSize: 12, color: "#6b7280" }}>
                <span>{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</span>
                {totalSec > 0 && <span>· {displayDuration(totalSec)} total</span>}
                {lessons.length > 0 && <span>· {lessons.filter((l) => l.isPreview).length} free preview{lessons.filter((l) => l.isPreview).length !== 1 ? "s" : ""}</span>}
              </div>
            </div>
            {!showAddForm && (
              <button
                onClick={() => { setShowAddForm(true); setExpandedLesson(null); }}
                style={{ background: purple, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                + Add Lesson
              </button>
            )}
          </div>

          {/* Empty state */}
          {lessons.length === 0 && !showAddForm && (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎬</div>
              <h3 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: 16, fontWeight: 800 }}>No lessons yet</h3>
              <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
                Add lessons to build your course curriculum.<br />
                You need at least 1 lesson before submitting for review.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                style={{ background: `linear-gradient(135deg, #8b6ef5, ${purple})`, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                + Add First Lesson
              </button>
            </div>
          )}

          {/* Lesson list */}
          {reordering && (
            <div style={{ padding: "8px 24px", background: "#fef3c7", fontSize: 12, fontWeight: 600, color: "#92400e", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 14, height: 14, border: "2px solid #92400e", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              Reordering…
            </div>
          )}
          {lessons.map((lesson, i) => (
            <LessonRow
              key={lesson._id}
              lesson={lesson}
              index={i}
              total={lessons.length}
              expanded={expandedLesson === lesson._id}
              onExpand={setExpandedLesson}
              onSave={handleLessonSave}
              onDelete={handleLessonDelete}
              onMoveUp={(idx) => swapLessons(idx, idx - 1)}
              onMoveDown={(idx) => swapLessons(idx, idx + 1)}
              saving={lessonSaving === lesson._id}
              deleting={lessonDeleting === lesson._id}
            />
          ))}

          {/* Add lesson form */}
          {showAddForm && (
            <AddLessonForm
              courseId={courseId}
              onSaved={handleLessonAdded}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {/* Footer */}
          {lessons.length > 0 && !showAddForm && (
            <div style={{ padding: "14px 24px", borderTop: "1px solid #f3f0fa", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => { setShowAddForm(true); setExpandedLesson(null); }}
                style={{ background: purpleLight, color: purple, border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                + Add Another Lesson
              </button>
              {totalSec > 0 && (
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                  Total: {displayDuration(totalSec)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom actions ── */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          {courseStatus === "draft" && (
            <button
              onClick={handleSubmitForReview}
              disabled={saving}
              style={{
                padding: "11px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                border: `1.5px solid ${purple}`, background: "transparent", color: purple,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              📤 Submit for Review
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "11px 32px", borderRadius: 12, fontSize: 14, fontWeight: 800,
              background: saving ? "#d1c4f7" : purple, color: "#fff",
              border: "none", cursor: saving ? "not-allowed" : "pointer",
              boxShadow: dirty && !saving ? "0 4px 14px rgba(95,73,153,0.35)" : "none",
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
