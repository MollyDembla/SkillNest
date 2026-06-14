import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCourses } from "../../services/courseService";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import toast from "react-hot-toast";

function CourseCard({ course }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, add: addToCart } = useCart();
  const { wishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const id = course._id;
  const inCart = cart?.items?.some((item) => item._id?.toString() === id);
  const inWishlist = wishlist?.courses?.some((c) => c._id?.toString() === id);
  const isStudent = user?.role === "student";

  const handleAddToCart = async (e) => {
    e.preventDefault();
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
        borderRadius: "1.5rem",
        background: "rgba(255,255,255,0.94)",
        boxShadow: "0 20px 60px rgba(95,73,153,0.10)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 28px 70px rgba(95,73,153,0.16)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 20px 60px rgba(95,73,153,0.10)";
      }}
    >
      <Link to={`/courses/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
        {/* Thumbnail */}
        <div
          style={{
            height: "160px",
            background: course.thumbnail
              ? `url(${course.thumbnail}) center/cover no-repeat`
              : "linear-gradient(135deg, #efe8ff 0%, #d8c4ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!course.thumbnail && (
            <span style={{ fontSize: "36px", opacity: 0.4 }}>📚</span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "18px 18px 12px" }}>
          {course.category && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#9b8ec4",
              }}
            >
              {course.category}
            </span>
          )}
          <h2
            style={{
              margin: "6px 0 4px",
              fontSize: "16px",
              fontWeight: 800,
              lineHeight: 1.3,
              color: "#3c3168",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.title}
          </h2>
          {course.instructor?.name && (
            <p style={{ margin: 0, fontSize: "12px", color: "#9b8ec4" }}>
              {course.instructor.name}
            </p>
          )}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "18px", fontWeight: 900, color: "#5d4e98" }}>
              {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
            </span>
            {course.averageRating > 0 && (
              <span style={{ fontSize: "12px", color: "#9b8ec4" }}>
                ⭐ {course.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      {(!user || isStudent) && (
        <div
          style={{
            padding: "0 18px 18px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "8px",
            marginTop: "auto",
          }}
        >
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            style={{
              border: "none",
              borderRadius: "14px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              opacity: cartLoading ? 0.7 : 1,
              background: inCart
                ? "#e8f9ee"
                : "linear-gradient(135deg, #7c5cbf 0%, #5f4999 100%)",
              color: inCart ? "#2a8d53" : "white",
              transition: "opacity 0.15s",
            }}
          >
            {cartLoading ? "…" : inCart ? "In Cart ✓" : "Add to Cart"}
          </button>

          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            title={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
            style={{
              border: "none",
              borderRadius: "14px",
              padding: "10px 14px",
              fontSize: "16px",
              cursor: "pointer",
              opacity: wishlistLoading ? 0.7 : 1,
              background: inWishlist ? "#fdeef3" : "#f4ebff",
              color: inWishlist ? "#c0284d" : "#5d4e98",
              transition: "opacity 0.15s",
            }}
          >
            {wishlistLoading ? "…" : inWishlist ? "♥" : "♡"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCourses({ limit: 12 });
        setCourses(res.data.courses || []);
      } catch {
        toast.error("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: "#f7f1fb" }}>
      <div className="mx-auto max-w-6xl">
        <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 900, color: "#3c3168" }}>
          Browse Courses
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: "15px", color: "#6d658e" }}>
          Explore our published courses and start learning today.
        </p>

        {loading ? (
          <div style={{ marginTop: "48px", textAlign: "center", color: "#9b8ec4" }}>
            Loading courses…
          </div>
        ) : courses.length === 0 ? (
          <div style={{ marginTop: "48px", textAlign: "center", color: "#9b8ec4" }}>
            No courses available yet.
          </div>
        ) : (
          <div
            className="mt-8"
            style={{
              display: "grid",
              gap: "20px",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
