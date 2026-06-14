import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import toast from "react-hot-toast";

function Stars({ rating }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: rating >= n ? "#e59819" : "#d1d7dc", fontSize: 12 }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, add: addToCart } = useCart();
  const { wishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  const id = course._id;
  const inCart = cart?.items?.some((item) => (item.course?._id || item._id)?.toString() === id);
  const inWishlist = wishlist?.courses?.some((c) => c._id?.toString() === id);
  const isStudent = user?.role === "student";

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/auth/login");
    if (inCart) return navigate("/cart");
    setCartLoading(true);
    try {
      await addToCart(id);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add to cart.");
    } finally {
      setCartLoading(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/auth/login");
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(id);
        toast.success("Removed from wishlist.");
      } else {
        await addToWishlist(id);
        toast.success("Saved to wishlist!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed.");
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? "#b4a7d6" : "#e8e8e8"}`,
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: hovered ? "0 2px 12px rgba(0,0,0,0.1)" : "none",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/courses/${id}`} style={{ textDecoration: "none", color: "inherit", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Thumbnail */}
        <div style={{ position: "relative", paddingTop: "56.25%", background: "#f0edf8", overflow: "hidden" }}>
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #ede9f8 0%, #d8c4ff 100%)",
            }} />
          )}
          {/* Bestseller badge */}
          {course.reviewsCount > 50 && course.averageRating >= 4.5 && (
            <span style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "#eceb98",
              color: "#3d3000",
              fontSize: 11,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 2,
            }}>
              Bestseller
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <h3 style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            color: "#1c1d1f",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {course.title}
          </h3>

          {course.instructor?.name && (
            <p style={{ margin: 0, fontSize: 12, color: "#6a6f73" }}>
              {course.instructor.name}
            </p>
          )}

          {course.averageRating > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#b4690e" }}>
                {course.averageRating.toFixed(1)}
              </span>
              <Stars rating={course.averageRating} />
              {course.reviewsCount > 0 && (
                <span style={{ fontSize: 11, color: "#6a6f73" }}>
                  ({course.reviewsCount.toLocaleString()})
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1c1d1f" }}>
              {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
            </span>
            {course.level && (
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#6a6f73",
                textTransform: "capitalize",
                background: "#f7f9fa",
                border: "1px solid #d1d7dc",
                padding: "2px 6px",
                borderRadius: 2,
                marginLeft: "auto",
              }}>
                {course.level}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      {(!user || isStudent) && (
        <div style={{ padding: "0 14px 12px", display: "flex", gap: 8 }}>
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 4,
              padding: "9px 12px",
              fontSize: 13,
              fontWeight: 700,
              cursor: cartLoading ? "not-allowed" : "pointer",
              background: inCart ? "#e8f9ee" : "#5f4999",
              color: inCart ? "#166534" : "#fff",
              transition: "background 0.15s",
              opacity: cartLoading ? 0.7 : 1,
            }}
          >
            {cartLoading ? "Adding…" : inCart ? "In cart ✓" : "Add to cart"}
          </button>
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            title={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
            style={{
              border: `1.5px solid ${inWishlist ? "#dc2626" : "#d1d7dc"}`,
              borderRadius: 4,
              padding: "9px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: wishlistLoading ? "not-allowed" : "pointer",
              background: inWishlist ? "#fef2f2" : "#fff",
              color: inWishlist ? "#dc2626" : "#6a6f73",
              transition: "all 0.15s",
              opacity: wishlistLoading ? 0.7 : 1,
              flexShrink: 0,
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {wishlistLoading ? "…" : inWishlist ? "Saved" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
