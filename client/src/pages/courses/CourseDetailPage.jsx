import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { getCourseById } from "../../services/courseService";
import { checkEnrollment } from "../../services/enrollmentService";
import { getCourseReviews, createReview, deleteReview } from "../../services/reviewService";
import { getOrCreateRoom } from "../../services/chatService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

// ─── helpers ─────────────────────────────────────────────────
function formatSeconds(s) {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function timeAgo(date) {
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

// ─── star display ─────────────────────────────────────────────
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: rating >= n ? "#f59e0b" : rating >= n - 0.5 ? "#fbbf24" : "#e5e7eb" }}>
          ★
        </span>
      ))}
    </span>
  );
}

// ─── interactive star picker ──────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 28,
            color: (hover || value) >= n ? "#f59e0b" : "#d1d5db",
            padding: "0 2px",
            transition: "color 0.1s",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ─── rating breakdown bar ─────────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 12, color: "#6b7280", width: 30, textAlign: "right" }}>{star} ★</span>
      <div style={{ flex: 1, height: 7, borderRadius: 99, background: "#f3f0fa", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#f59e0b", borderRadius: 99, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 12, color: "#9ca3af", width: 24 }}>{count}</span>
    </div>
  );
}

// ─── review card ──────────────────────────────────────────────
function ReviewCard({ review, currentUserId, onDelete }) {
  const initial = review.student?.name?.charAt(0).toUpperCase() || "?";
  const isOwn = review.student?._id === currentUserId || review.student?.id === currentUserId;

  return (
    <div style={{ padding: "20px 0", borderBottom: "1px solid #f3f0fa" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: purpleLight, color: purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
          {review.student?.avatar
            ? <img src={review.student.avatar} alt="" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }} />
            : initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, color: purpleDark }}>{review.student?.name || "Student"}</span>
              <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>{timeAgo(review.createdAt)}</span>
            </div>
            {isOwn && (
              <button
                onClick={() => onDelete(review._id)}
                style={{ background: "none", border: "none", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}
              >
                Delete
              </button>
            )}
          </div>
          <Stars rating={review.rating} size={13} />
        </div>
      </div>
      {review.comment && (
        <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{review.comment}</p>
      )}
    </div>
  );
}

// ─── curriculum lesson row ────────────────────────────────────
function LessonRow({ lesson, index, isEnrolled, courseId, onLessonClick }) {
  const duration = formatSeconds(lesson.videoDuration);
  return (
    <div
      onClick={() => onLessonClick(index)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderBottom: "1px solid #f7f5ff",
        cursor: "pointer",
        transition: "background 0.15s",
        borderRadius: 8,
        paddingLeft: 8,
        marginLeft: -8,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#f7f5ff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: purpleLight, color: purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
        {index + 1}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: purpleDark, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {lesson.title}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {lesson.isPreview && (
          <span style={{ fontSize: 10, fontWeight: 700, background: "#ede9f8", color: purple, padding: "2px 7px", borderRadius: 99 }}>
            Preview
          </span>
        )}
        {duration && (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{duration}</span>
        )}
        <span style={{ fontSize: 13, color: isEnrolled ? "#16a34a" : "#d1d5db" }}>
          {isEnrolled ? "▶" : "🔒"}
        </span>
      </div>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, add: addToCart } = useCart();
  const { wishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(true);
  const [showAllLessons, setShowAllLessons] = useState(false);

  // Review form
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [myReview, setMyReview] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, reviewsRes] = await Promise.all([
          getCourseById(courseId),
          getCourseReviews(courseId).catch(() => ({ data: { reviews: [] } })),
        ]);
        const c = courseRes.data.course;
        setCourse(c);
        setLessons(c?.lessons || []);
        setReviews(reviewsRes.data.reviews || []);
      } catch {
        toast.error("Course not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  // Check enrollment when user is a student
  useEffect(() => {
    if (user?.role !== "student") return;
    checkEnrollment(courseId)
      .then((res) => setIsEnrolled(res.data.isEnrolled))
      .catch(() => {});
  }, [courseId, user]);

  // Find logged-in student's own review
  useEffect(() => {
    if (!user || user.role !== "student") return;
    const own = reviews.find(
      (r) => r.student?._id === user.id || r.student?._id === user._id
    );
    setMyReview(own || null);
  }, [reviews, user]);

  const inCart = cart?.items?.some((i) => (i.course?._id || i._id)?.toString() === courseId);
  const inWishlist = wishlist?.courses?.some((c) => c._id?.toString() === courseId);
  const isStudent = user?.role === "student";

  // Rating breakdown
  const ratingBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { if (counts[r.rating] !== undefined) counts[r.rating]++; });
    return counts;
  }, [reviews]);

  const totalDuration = useMemo(
    () => lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0),
    [lessons]
  );

  // Cart handler
  const handleAddToCart = async () => {
    if (!user) return navigate("/auth/login", { state: { from: { pathname: `/courses/${courseId}` } } });
    if (inCart) return navigate("/cart");
    setCartLoading(true);
    try {
      await addToCart(courseId);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add to cart.");
    } finally {
      setCartLoading(false);
    }
  };

  // Wishlist handler
  const handleWishlist = async () => {
    if (!user) return navigate("/auth/login", { state: { from: { pathname: `/courses/${courseId}` } } });
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(courseId);
        toast.success("Removed from wishlist.");
      } else {
        await addToWishlist(courseId);
        toast.success("Saved to wishlist!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed.");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleMessageInstructor = async () => {
    if (!course?.instructor?._id) return;
    setMsgLoading(true);
    try {
      const res = await getOrCreateRoom(course.instructor._id, courseId);
      navigate(`/messages?room=${res.data.room._id}`);
    } catch {
      toast.error("Could not open chat. Please try again.");
    } finally {
      setMsgLoading(false);
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) return toast.error("Please select a star rating.");
    setReviewLoading(true);
    try {
      const res = await createReview(courseId, { rating: reviewRating, comment: reviewComment });
      const newReview = res.data.review;
      setReviews((prev) => [newReview, ...prev]);
      setMyReview(newReview);
      setReviewRating(0);
      setReviewComment("");
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setMyReview(null);
      toast.success("Review deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete review.");
    }
  };

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f1fb" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: "#9b8ec4", margin: 0, fontSize: 14 }}>Loading course…</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#f7f1fb" }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <h2 style={{ margin: 0, color: purpleDark }}>Course not found</h2>
        <Link to="/courses" style={{ color: purple, fontWeight: 700, textDecoration: "none" }}>← Back to Courses</Link>
      </div>
    );
  }

  const visibleLessons = showAllLessons ? lessons : lessons.slice(0, 6);
  const currentUserId = user?.id || user?._id;

  const courseDetailStyles = `
    .course-detail-body {
      max-width: 1100px;
      margin: 0 auto;
      padding: 32px 24px 60px;
    }
    .course-detail-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 28px;
      align-items: start;
    }
    .course-detail-sidebar {
      position: sticky;
      top: 24px;
    }
    .course-hero-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 32px;
      align-items: start;
    }
    .course-hero-thumb {
      width: 200px;
      border-radius: 16px;
      overflow: hidden;
      flex-shrink: 0;
    }
    @media (max-width: 900px) {
      .course-detail-grid {
        grid-template-columns: 1fr;
      }
      .course-detail-sidebar {
        position: static;
        top: auto;
      }
      .course-hero-thumb {
        display: none;
      }
      .course-hero-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 600px) {
      .course-detail-body {
        padding: 20px 16px 40px;
      }
    }
  `;

  return (
    <div style={{ background: "#f7f1fb", minHeight: "100vh" }}>
      <style>{courseDetailStyles}</style>

      {/* ── Hero banner ── */}
      <div
        style={{
          background: `linear-gradient(135deg, #0f0a1e 0%, ${purpleDark} 60%, #4a2d8a 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* blurred thumbnail as background */}
        {course.thumbnail && (
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${course.thumbnail})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: 0.12, filter: "blur(20px)", transform: "scale(1.1)",
            }}
          />
        )}
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "clamp(24px, 4vw, 44px) clamp(16px, 4vw, 24px) 52px" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 12, marginBottom: 20, color: "rgba(255,255,255,0.45)", display: "flex", gap: 6, alignItems: "center" }}>
            <Link to="/courses" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontWeight: 600 }}>Courses</Link>
            <span>/</span>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>{course.category}</span>
          </div>

          <div className="course-hero-grid">
            <div>
              {/* Pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {course.category && (
                  <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, textTransform: "capitalize" }}>
                    {course.level}
                  </span>
                )}
              </div>

              <h1 style={{ color: "#fff", margin: "0 0 12px", fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 900, lineHeight: 1.25, maxWidth: 620 }}>
                {course.title}
              </h1>
              {course.subtitle && (
                <p style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 18px", fontSize: 15, lineHeight: 1.6, maxWidth: 580 }}>
                  {course.subtitle}
                </p>
              )}

              {/* Meta row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", fontSize: 13 }}>
                {course.averageRating > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Stars rating={course.averageRating} size={15} />
                    <span style={{ color: "#fbbf24", fontWeight: 800 }}>{course.averageRating.toFixed(1)}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>({course.reviewsCount} reviews)</span>
                  </div>
                )}
                {course.instructor?.name && (
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>
                    👤 <strong style={{ color: "rgba(255,255,255,0.85)" }}>{course.instructor.name}</strong>
                  </span>
                )}
                {lessons.length > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>
                    📖 <strong style={{ color: "rgba(255,255,255,0.85)" }}>{lessons.length}</strong> lessons
                  </span>
                )}
                {totalDuration > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>
                    ⏱ <strong style={{ color: "rgba(255,255,255,0.85)" }}>{formatSeconds(totalDuration)}</strong> total
                  </span>
                )}
              </div>
            </div>

            {/* Hero thumbnail */}
            {course.thumbnail && (
              <div className="course-hero-thumb">
                <img src={course.thumbnail} alt={course.title} style={{ width: "100%", display: "block" }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="course-detail-body">
        <div className="course-detail-grid">

          {/* ── Left column ── */}
          <div style={{ minWidth: 0 }}>

            {/* Description */}
            <section style={{ background: "#fff", borderRadius: 18, padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
              <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800, color: purpleDark }}>About this course</h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.9, color: "#374151", whiteSpace: "pre-line" }}>
                {course.description}
              </p>
            </section>

            {/* Curriculum */}
            {lessons.length > 0 && (
              <section style={{ background: "#fff", borderRadius: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20, overflow: "hidden" }}>
                <button
                  onClick={() => setCurriculumOpen((v) => !v)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "20px 28px", background: "none", border: "none", cursor: "pointer",
                    borderBottom: curriculumOpen ? "1px solid #f3f0fa" : "none",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: purpleDark }}>Course Curriculum</h2>
                    <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6b7280" }}>
                      {lessons.length} lessons{totalDuration ? ` · ${formatSeconds(totalDuration)} total` : ""}
                    </p>
                  </div>
                  <span style={{ fontSize: 18, color: purple, transform: curriculumOpen ? "rotate(0)" : "rotate(-90deg)", transition: "transform 0.2s" }}>▾</span>
                </button>

                {curriculumOpen && (
                  <div style={{ padding: "8px 28px 4px" }}>
                    {visibleLessons.map((lesson, i) => (
                      <LessonRow
                        key={lesson._id}
                        lesson={lesson}
                        index={i}
                        isEnrolled={isEnrolled}
                        courseId={courseId}
                        onLessonClick={(idx) => {
                          if (isEnrolled) {
                            navigate(`/learn/${courseId}?lesson=${idx}`);
                          } else if (!user || user.role === "student") {
                            if (!user) {
                              navigate("/auth/login", { state: { from: { pathname: `/courses/${courseId}` } } });
                            } else {
                              if (inCart) {
                                navigate("/cart");
                              } else {
                                addToCart(courseId)
                                  .then(() => navigate("/cart"))
                                  .catch(() => navigate("/cart"));
                              }
                            }
                          } else {
                            toast.info("Enrollment not available for your account type.");
                          }
                        }}
                      />
                    ))}

                    {lessons.length > 6 && (
                      <button
                        onClick={() => setShowAllLessons((v) => !v)}
                        style={{
                          display: "block", width: "100%", margin: "12px 0 16px",
                          background: purpleLight, color: purple, border: "none",
                          borderRadius: 10, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer",
                        }}
                      >
                        {showAllLessons
                          ? "Show less"
                          : `Show all ${lessons.length} lessons`}
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Instructor */}
            {course.instructor && (
              <section style={{ background: "#fff", borderRadius: 18, padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: purpleDark }}>Your Instructor</h2>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: purpleLight, color: purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
                    {course.instructor.avatar
                      ? <img src={course.instructor.avatar} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }} />
                      : course.instructor.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: purpleDark }}>{course.instructor.name}</div>
                    {course.instructor.bio && (
                      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                        {course.instructor.bio}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Reviews */}
            <section style={{ background: "#fff", borderRadius: 18, padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: purpleDark }}>
                Reviews
                {reviews.length > 0 && (
                  <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>
                    ({reviews.length})
                  </span>
                )}
              </h2>

              {/* Rating summary */}
              {reviews.length > 0 && (
                <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 52, fontWeight: 900, color: purpleDark, lineHeight: 1 }}>
                      {course.averageRating?.toFixed(1) || "—"}
                    </div>
                    <Stars rating={course.averageRating || 0} size={18} />
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>Course rating</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <RatingBar key={star} star={star} count={ratingBreakdown[star]} total={reviews.length} />
                    ))}
                  </div>
                </div>
              )}

              {/* Write a review (enrolled students who haven't reviewed yet) */}
              {isStudent && isEnrolled && !myReview && (
                <form
                  onSubmit={handleReviewSubmit}
                  style={{
                    background: "#faf8ff", borderRadius: 14,
                    padding: "20px", marginBottom: 24,
                    border: `1.5px solid ${purpleLight}`,
                  }}
                >
                  <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800, color: purpleDark }}>Write a review</h3>
                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this course… (optional)"
                    rows={3}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      marginTop: 12, border: `1.5px solid ${purpleLight}`,
                      borderRadius: 10, padding: "10px 12px",
                      fontSize: 14, resize: "vertical", outline: "none",
                      fontFamily: "inherit", background: "#fff",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={reviewLoading || !reviewRating}
                    style={{
                      marginTop: 10, background: reviewRating ? purple : "#e5e7eb",
                      color: reviewRating ? "#fff" : "#9ca3af",
                      border: "none", borderRadius: 10, padding: "10px 22px",
                      fontWeight: 800, fontSize: 13,
                      cursor: (reviewLoading || !reviewRating) ? "not-allowed" : "pointer",
                      opacity: reviewLoading ? 0.7 : 1,
                    }}
                  >
                    {reviewLoading ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}

              {/* Review list */}
              {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af", fontSize: 14 }}>
                  No reviews yet. Be the first to review this course!
                </div>
              ) : (
                reviews.map((r) => (
                  <ReviewCard
                    key={r._id}
                    review={r}
                    currentUserId={currentUserId}
                    onDelete={handleDeleteReview}
                  />
                ))
              )}
            </section>
          </div>

          {/* ── Right sidebar (sticky) ── */}
          <div className="course-detail-sidebar">
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(95,73,153,0.13)", overflow: "hidden" }}>
              {/* Thumbnail */}
              {course.thumbnail && (
                <div style={{ height: 180, overflow: "hidden" }}>
                  <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              <div style={{ padding: "22px" }}>
                {/* Price */}
                <div style={{ fontSize: 34, fontWeight: 900, color: purpleDark, marginBottom: 18 }}>
                  {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
                </div>

                {/* CTA buttons */}
                {isEnrolled ? (
                  <>
                    <Link
                      to={`/learn/${courseId}`}
                      style={{
                        display: "block", textAlign: "center", textDecoration: "none",
                        background: `linear-gradient(135deg, #22c55e, #16a34a)`,
                        color: "#fff", borderRadius: 14, padding: "14px 0",
                        fontWeight: 800, fontSize: 15,
                        boxShadow: "0 8px 24px rgba(22,163,74,0.3)",
                        marginBottom: 10,
                      }}
                    >
                      ▶ Continue Learning
                    </Link>
                    {user?.role === "student" && course?.instructor?._id && (
                      <button
                        onClick={handleMessageInstructor}
                        disabled={msgLoading}
                        style={{
                          width: "100%", border: `1.5px solid ${purple}`,
                          borderRadius: 14, padding: "12px 0", fontSize: 14, fontWeight: 700,
                          background: "#fff", color: purple,
                          cursor: msgLoading ? "not-allowed" : "pointer",
                          opacity: msgLoading ? 0.7 : 1,
                          marginBottom: 10,
                        }}
                      >
                        {msgLoading ? "Opening chat…" : "💬 Message Instructor"}
                      </button>
                    )}
                  </>
                ) : (!user || isStudent) ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={cartLoading}
                      style={{
                        width: "100%", border: "none", borderRadius: 14,
                        padding: "14px 0", fontSize: 15, fontWeight: 800,
                        background: inCart
                          ? purpleLight
                          : `linear-gradient(135deg, #8b6ef5, ${purple})`,
                        color: inCart ? purple : "#fff",
                        boxShadow: inCart ? "none" : "0 10px 28px rgba(95,73,153,0.3)",
                        cursor: cartLoading ? "not-allowed" : "pointer",
                        opacity: cartLoading ? 0.7 : 1,
                        marginBottom: 10,
                      }}
                    >
                      {cartLoading ? "Adding…" : inCart ? "Go to Cart →" : "Add to Cart"}
                    </button>

                    <button
                      onClick={handleWishlist}
                      disabled={wishlistLoading}
                      style={{
                        width: "100%", border: `1.5px solid ${purpleLight}`,
                        borderRadius: 14, padding: "12px 0", fontSize: 14, fontWeight: 700,
                        background: inWishlist ? purpleLight : "#fff",
                        color: purple,
                        cursor: wishlistLoading ? "not-allowed" : "pointer",
                        opacity: wishlistLoading ? 0.7 : 1,
                        marginBottom: 10,
                      }}
                    >
                      {wishlistLoading ? "…" : inWishlist ? "♥ Saved" : "♡ Wishlist"}
                    </button>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", margin: "0 0 10px" }}>
                    Sign in with a student account to enrol.
                  </p>
                )}

                {/* Course includes */}
                <div style={{ borderTop: `1px solid ${purpleLight}`, paddingTop: 16, display: "flex", flexDirection: "column", gap: 9 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    This course includes
                  </p>
                  {lessons.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>📖 Lessons</span>
                      <span style={{ fontWeight: 700, color: purpleDark }}>{lessons.length}</span>
                    </div>
                  )}
                  {totalDuration > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>⏱ Duration</span>
                      <span style={{ fontWeight: 700, color: purpleDark }}>{formatSeconds(totalDuration)}</span>
                    </div>
                  )}
                  {course.level && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>📊 Level</span>
                      <span style={{ fontWeight: 700, color: purpleDark, textTransform: "capitalize" }}>{course.level}</span>
                    </div>
                  )}
                  {course.estimatedDuration && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#6b7280" }}>🕐 Est. time</span>
                      <span style={{ fontWeight: 700, color: purpleDark }}>{course.estimatedDuration}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#6b7280" }}>📱 Access</span>
                    <span style={{ fontWeight: 700, color: purpleDark }}>Lifetime</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#6b7280" }}>🏆 Certificate</span>
                    <span style={{ fontWeight: 700, color: purpleDark }}>On completion</span>
                  </div>
                </div>

                {/* Money-back note */}
                {(!user || isStudent) && !isEnrolled && (
                  <p style={{ margin: "14px 0 0", fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
                    30-day money-back guarantee
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
