import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getCourseById } from "../../services/courseService";
import { checkEnrollment } from "../../services/enrollmentService";
import { getCourseProgress, markLessonComplete } from "../../services/progressService";

// ─── helpers ────────────────────────────────────────────────
function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function resolveVideoType(url) {
  if (!url) return null;
  if (/youtu\.be|youtube\.com/.test(url)) return "youtube";
  if (/vimeo\.com/.test(url)) return "vimeo";
  return "native";
}

function toEmbedUrl(url) {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?rel=0`;
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

// ─── video player ────────────────────────────────────────────
function VideoPlayer({ lesson, onEnded }) {
  const videoRef = useRef(null);
  const type = resolveVideoType(lesson?.videoUrl);

  if (!lesson?.videoUrl) {
    return (
      <div
        style={{
          aspectRatio: "16/9",
          borderRadius: 12,
          background: "#0d0b14",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 48, opacity: 0.15 }}>▶</span>
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          No video for this lesson yet.
        </p>
      </div>
    );
  }

  if (type === "youtube" || type === "vimeo") {
    return (
      <div
        style={{
          position: "relative",
          paddingBottom: "56.25%",
          height: 0,
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <iframe
          key={lesson._id}
          src={toEmbedUrl(lesson.videoUrl)}
          title={lesson.title}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      key={lesson._id}
      src={lesson.videoUrl}
      controls
      onEnded={onEnded}
      style={{
        width: "100%",
        borderRadius: 12,
        background: "#0d0b14",
        display: "block",
        maxHeight: "60vh",
      }}
    />
  );
}

// ─── lesson row ──────────────────────────────────────────────
function LessonRow({ lesson, index, isActive, isCompleted, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 18px",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
        textAlign: "left",
        background: isActive ? "rgba(124,92,191,0.22)" : "transparent",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          flexShrink: 0,
          marginTop: 2,
          width: 24,
          height: 24,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 800,
          background: isCompleted
            ? "#16a34a"
            : isActive
            ? "#7c5cbf"
            : "rgba(255,255,255,0.08)",
          color:
            isCompleted || isActive ? "#fff" : "rgba(255,255,255,0.3)",
        }}
      >
        {isCompleted ? "✓" : index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: isActive ? 700 : 500,
            color: isActive
              ? "#fff"
              : isCompleted
              ? "rgba(255,255,255,0.45)"
              : "rgba(255,255,255,0.7)",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {lesson.title}
        </p>
        {lesson.videoDuration > 0 && (
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            {formatDuration(lesson.videoDuration)}
          </p>
        )}
      </div>
      {isCompleted && (
        <span style={{ fontSize: 14, flexShrink: 0, alignSelf: "center", color: "#16a34a" }}>✓</span>
      )}
    </button>
  );
}

// ─── completion overlay ──────────────────────────────────────
function CompletionOverlay({ courseName, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { from { transform: scale(0.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
      `}</style>
      <div
        style={{
          background: "linear-gradient(135deg, #1e1340, #2d1b69)",
          border: "1px solid rgba(124,92,191,0.4)",
          borderRadius: 24,
          padding: "48px 40px",
          textAlign: "center",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16, animation: "float 2s ease-in-out infinite" }}>
          🎉
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 900, color: "#fff" }}>
          Course Complete!
        </h2>
        <p style={{ margin: "0 0 8px", fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
          You've finished
        </p>
        <p
          style={{
            margin: "0 0 28px",
            fontSize: 16,
            fontWeight: 800,
            color: "#a78be8",
            lineHeight: 1.4,
          }}
        >
          "{courseName}"
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link
            to="/my-learning"
            style={{
              display: "block",
              background: "linear-gradient(135deg, #8b6ef5, #5f4999)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 12,
              padding: "13px 0",
              fontWeight: 800,
              fontSize: 14,
              boxShadow: "0 8px 24px rgba(95,73,153,0.4)",
            }}
          >
            Back to My Learning
          </Link>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
              border: "none",
              borderRadius: 12,
              padding: "13px 0",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Review Course
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────
export default function LearningPlayerPage() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [marking, setMarking] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load everything in parallel
  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, enrollRes, progressRes] = await Promise.all([
          getCourseById(courseId),
          checkEnrollment(courseId),
          getCourseProgress(courseId).catch(() => ({
            data: { completedLessons: [], progressPercentage: 0, currentLesson: null },
          })),
        ]);

        const loadedCourse = courseRes.data.course;
        const loadedLessons = loadedCourse?.lessons || [];
        const isEnrolled = enrollRes.data.isEnrolled;

        setCourse(loadedCourse);
        setLessons(loadedLessons);
        setEnrolled(isEnrolled);

        if (isEnrolled && progressRes.data) {
          const completed = new Set(progressRes.data.completedLessons || []);
          setCompletedLessons(completed);
          setProgressPercentage(progressRes.data.progressPercentage || 0);

          const currentLessonId = progressRes.data.currentLesson;
          if (currentLessonId) {
            const idx = loadedLessons.findIndex((l) => l._id === currentLessonId);
            // If currently at last lesson, stay there; otherwise resume at next incomplete
            if (idx !== -1) {
              const alreadyComplete = completed.has(currentLessonId);
              const nextIdx = alreadyComplete
                ? loadedLessons.findIndex((l) => !completed.has(l._id))
                : idx;
              setActiveLessonIndex(nextIdx !== -1 ? nextIdx : idx);
            }
          }
        }
      } catch {
        setEnrolled(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  // Keyboard nav: left/right arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") setActiveLessonIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setActiveLessonIndex((i) => Math.min(lessons.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lessons.length]);

  const activeLesson = lessons[activeLessonIndex] || null;
  const isCurrentCompleted = activeLesson ? completedLessons.has(activeLesson._id) : false;

  const handleMarkComplete = useCallback(async () => {
    if (!activeLesson || marking || isCurrentCompleted) return;
    setMarking(true);
    try {
      const res = await markLessonComplete(courseId, activeLesson._id);
      const updated = new Set(res.data.completedLessons);
      setCompletedLessons(updated);
      setProgressPercentage(res.data.progressPercentage);

      if (res.data.isCompleted) {
        setShowCompletion(true);
      } else {
        toast.success("Lesson complete!");
        // Auto-advance after brief delay
        if (activeLessonIndex < lessons.length - 1) {
          setTimeout(() => setActiveLessonIndex((i) => i + 1), 500);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark lesson.");
    } finally {
      setMarking(false);
    }
  }, [activeLesson, marking, isCurrentCompleted, courseId, activeLessonIndex, lessons.length]);

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#1a1625",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid rgba(255,255,255,0.08)",
            borderTop: "4px solid #7c5cbf",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
          Loading course…
        </p>
      </div>
    );
  }

  // ── Not enrolled ─────────────────────────────────────────
  if (!enrolled) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f1fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            borderRadius: 24,
            background: "#fff",
            boxShadow: "0 25px 80px rgba(95,73,153,0.12)",
            padding: "48px 40px",
            textAlign: "center",
            maxWidth: 420,
            width: "100%",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
          <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: "#3c3168" }}>
            Not enrolled
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6d658e", lineHeight: 1.8 }}>
            You need to enrol in this course to access its lessons.
          </p>
          <Link
            to={`/courses/${courseId}`}
            style={{
              display: "inline-block",
              borderRadius: 999,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 800,
              textDecoration: "none",
              color: "#fff",
              background: "linear-gradient(135deg, #7c5cbf, #5f4999)",
              boxShadow: "0 10px 24px rgba(95,73,153,0.25)",
            }}
          >
            View Course
          </Link>
        </div>
      </div>
    );
  }

  const completedCount = completedLessons.size;
  const totalLessons = lessons.length;

  // ── Player layout ─────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#1a1625", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .sidebar-overlay { position: fixed !important; top: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 100 !important; width: 280px !important; box-shadow: -8px 0 32px rgba(0,0,0,0.5) !important; }
        }
      `}</style>

      {/* ── Top bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
          background: "#16121f",
        }}
      >
        <Link
          to="/my-learning"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.4)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ← My Learning
        </Link>

        <h1
          style={{
            margin: 0,
            flex: 1,
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {course?.title}
        </h1>

        {/* Progress bar + % */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div
            style={{
              width: 110,
              height: 4,
              borderRadius: 99,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercentage}%`,
                background: progressPercentage >= 100 ? "#16a34a" : "#7c5cbf",
                borderRadius: 99,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
            {progressPercentage}%
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen((v) => !v)}
          title={sidebarOpen ? "Hide lesson list" : "Show lesson list"}
          style={{
            border: "none",
            background: sidebarOpen ? "rgba(124,92,191,0.25)" : "rgba(255,255,255,0.06)",
            borderRadius: 8,
            padding: "6px 11px",
            cursor: "pointer",
            color: sidebarOpen ? "#a78be8" : "rgba(255,255,255,0.4)",
            fontSize: 14,
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          ☰
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

          {/* Video */}
          <VideoPlayer lesson={activeLesson} onEnded={handleMarkComplete} />

          {/* Lesson header */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.3,
                }}
              >
                {activeLesson?.title || "Select a lesson"}
              </h2>
              <p style={{ margin: "5px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                Lesson {activeLessonIndex + 1} of {totalLessons}
                {activeLesson?.videoDuration
                  ? ` · ${formatDuration(activeLesson.videoDuration)}`
                  : ""}
                {activeLesson?.isPreview && (
                  <span
                    style={{
                      marginLeft: 8,
                      background: "rgba(124,92,191,0.3)",
                      color: "#a78be8",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 99,
                    }}
                  >
                    Preview
                  </span>
                )}
              </p>
            </div>

            {/* Mark complete button */}
            <button
              onClick={handleMarkComplete}
              disabled={marking || isCurrentCompleted || !activeLesson}
              style={{
                flexShrink: 0,
                border: "none",
                borderRadius: 12,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 800,
                cursor: isCurrentCompleted ? "default" : marking ? "not-allowed" : "pointer",
                background: isCurrentCompleted
                  ? "rgba(22,163,74,0.15)"
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: isCurrentCompleted ? "#4ade80" : "#fff",
                opacity: (marking || !activeLesson) ? 0.6 : 1,
                transition: "opacity 0.15s",
                boxShadow: isCurrentCompleted ? "none" : "0 6px 20px rgba(22,163,74,0.3)",
              }}
            >
              {isCurrentCompleted ? "✓ Completed" : marking ? "Saving…" : "Mark Complete"}
            </button>
          </div>

          {/* Description */}
          {activeLesson?.description && (
            <div
              style={{
                marginTop: 20,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "18px 20px",
              }}
            >
              <h4 style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                About this lesson
              </h4>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.6)" }}>
                {activeLesson.description}
              </p>
            </div>
          )}

          {/* Resources */}
          {activeLesson?.resources?.length > 0 && (
            <div
              style={{
                marginTop: 12,
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "18px 20px",
              }}
            >
              <h4 style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Resources
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activeLesson.resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 13,
                      color: "#a78be8",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>📎</span> {r.title || r.url}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Prev / Next nav */}
          <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <button
              onClick={() => setActiveLessonIndex((i) => Math.max(0, i - 1))}
              disabled={activeLessonIndex === 0}
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "10px 20px",
                background: "transparent",
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
                fontWeight: 700,
                cursor: activeLessonIndex === 0 ? "not-allowed" : "pointer",
                opacity: activeLessonIndex === 0 ? 0.3 : 1,
              }}
            >
              ← Previous
            </button>
            <button
              onClick={() =>
                setActiveLessonIndex((i) => Math.min(totalLessons - 1, i + 1))
              }
              disabled={activeLessonIndex === totalLessons - 1}
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                padding: "10px 20px",
                background:
                  activeLessonIndex === totalLessons - 1
                    ? "transparent"
                    : "rgba(124,92,191,0.25)",
                color:
                  activeLessonIndex === totalLessons - 1
                    ? "rgba(255,255,255,0.45)"
                    : "#a78be8",
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  activeLessonIndex === totalLessons - 1 ? "not-allowed" : "pointer",
                opacity: activeLessonIndex === totalLessons - 1 ? 0.3 : 1,
              }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            style={{
              width: 300,
              flexShrink: 0,
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              background: "#16121f",
            }}
          >
            {/* Sidebar header */}
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Course Content
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                  {completedCount} / {totalLessons} lessons
                </span>
              </div>
              {/* Mini progress bar */}
              <div style={{ height: 3, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0}%`,
                    background: progressPercentage >= 100 ? "#16a34a" : "#7c5cbf",
                    borderRadius: 99,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            {/* Lesson list */}
            {lessons.length === 0 ? (
              <div style={{ padding: "32px 18px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
                  No lessons yet.
                </p>
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <LessonRow
                  key={lesson._id}
                  lesson={lesson}
                  index={index}
                  isActive={index === activeLessonIndex}
                  isCompleted={completedLessons.has(lesson._id)}
                  onClick={() => {
                    setActiveLessonIndex(index);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Completion overlay ── */}
      {showCompletion && (
        <CompletionOverlay
          courseName={course?.title}
          onClose={() => setShowCompletion(false)}
        />
      )}
    </div>
  );
}
