import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const purple      = "#5f4999";
const purpleDark  = "#3c3168";
const purpleLight = "#ede9f8";

export default function WishlistPage() {
  const { wishlist, remove, moveToCart } = useWishlist();
  const { reload } = useCart();

  if (!wishlist) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={{
              width: 40, height: 40,
              border: `4px solid ${purpleLight}`,
              borderTop: `4px solid ${purple}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }}
          />
        </div>
      </div>
    );
  }

  const courses = wishlist.courses || [];

  const handleMove = async (courseId, title) => {
    try {
      await moveToCart(courseId);
      await reload();
      toast.success(`"${title}" moved to cart.`);
    } catch {
      toast.error("Failed to move to cart.");
    }
  };

  const handleRemove = async (courseId, title) => {
    try {
      await remove(courseId);
      toast.success(`"${title}" removed from wishlist.`);
    } catch {
      toast.error("Failed to remove.");
    }
  };

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)`, padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 900, margin: 0 }}>My Wishlist</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "6px 0 0" }}>
            {courses.length === 0
              ? "Your wishlist is empty."
              : `${courses.length} course${courses.length !== 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        {/* Empty state */}
        {courses.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "72px 32px",
              textAlign: "center",
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: purpleLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 800, color: purpleDark }}>
              Your wishlist is empty
            </h2>
            <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: 14, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
              Browse courses you're interested in and save them here for later.
            </p>
            <Link
              to="/courses"
              style={{
                display: "inline-block",
                background: purple,
                color: "#fff",
                padding: "11px 28px",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {courses.map((course) => {
              const rating = course.averageRating;
              return (
                <div
                  key={course._id}
                  style={{
                    background: "#fff",
                    borderRadius: 14,
                    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f0edf8",
                    display: "flex",
                    gap: 18,
                    alignItems: "flex-start",
                    padding: "18px 22px",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(95,73,153,0.12)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 8px rgba(0,0,0,0.06)")}
                >
                  {/* Thumbnail */}
                  <Link to={`/courses/${course._id}`} style={{ flexShrink: 0 }}>
                    <div
                      style={{
                        width: 110,
                        height: 74,
                        borderRadius: 10,
                        overflow: "hidden",
                        background: purpleLight,
                      }}
                    >
                      {course.thumbnail
                        ? <img src={course.thumbnail} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: purpleLight }} />
                      }
                    </div>
                  </Link>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/courses/${course._id}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          fontWeight: 800,
                          color: purpleDark,
                          fontSize: 15,
                          lineHeight: 1.35,
                          marginBottom: 4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {course.title}
                      </div>
                    </Link>

                    {course.instructor?.name && (
                      <div style={{ fontSize: 12, color: "#9b8ec4", marginBottom: 8 }}>
                        {course.instructor.name}
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      {/* Category badge */}
                      {course.category && (
                        <span
                          style={{
                            fontSize: 11,
                            background: purpleLight,
                            color: purple,
                            padding: "2px 10px",
                            borderRadius: 99,
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        >
                          {course.category}
                        </span>
                      )}
                      {/* Level badge */}
                      {course.level && (
                        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "capitalize" }}>
                          {course.level}
                        </span>
                      )}
                      {/* Rating */}
                      {rating && rating > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316" }}>
                          {rating.toFixed(1)} / 5
                          {course.reviewsCount > 0 && (
                            <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 3 }}>
                              ({course.reviewsCount})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: purpleDark }}>
                      {course.price === 0 ? "Free" : `$${course.price?.toFixed(2) ?? "0.00"}`}
                    </div>

                    <button
                      onClick={() => handleMove(course._id, course.title)}
                      style={{
                        background: purple,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = purpleDark)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = purple)}
                    >
                      Move to Cart
                    </button>

                    <button
                      onClick={() => handleRemove(course._id, course.title)}
                      style={{
                        background: "none",
                        color: "#dc2626",
                        border: "1px solid #fca5a5",
                        borderRadius: 8,
                        padding: "7px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Browse CTA */}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <Link
                to="/courses"
                style={{
                  display: "inline-block",
                  color: purple,
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  background: purpleLight,
                  padding: "10px 22px",
                  borderRadius: 10,
                }}
              >
                Browse more courses
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
