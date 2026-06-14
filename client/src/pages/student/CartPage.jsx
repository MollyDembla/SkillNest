import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

function CartItem({ item, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item._id || item.course?._id);
    setRemoving(false);
  };

  const title = item.title || item.course?.title || "Untitled Course";
  const price = item.price ?? item.course?.price ?? 0;
  const thumbnail = item.thumbnail || item.course?.thumbnail;
  const instructor = item.instructor?.name || item.course?.instructor?.name;
  const courseId = item._id || item.course?._id;

  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        padding: "20px 24px",
        borderBottom: "1px solid #f3f0fa",
        alignItems: "flex-start",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#faf8ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 110,
          height: 72,
          borderRadius: 10,
          overflow: "hidden",
          background: purpleLight,
          flexShrink: 0,
        }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={purple} strokeWidth="1.5">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          to={`/courses/${courseId}`}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: purpleDark,
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              marginBottom: 4,
            }}
          >
            {title}
          </div>
        </Link>
        {instructor && (
          <div style={{ fontSize: 12, color: "#9b8ec4", marginBottom: 10 }}>
            {instructor}
          </div>
        )}
        <button
          onClick={handleRemove}
          disabled={removing}
          style={{
            background: "none",
            border: "none",
            cursor: removing ? "not-allowed" : "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: "#dc2626",
            padding: 0,
            opacity: removing ? 0.5 : 1,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          {removing ? "Removing…" : "Remove"}
        </button>
      </div>

      {/* Price */}
      <div style={{ fontWeight: 800, fontSize: 17, color: purpleDark, flexShrink: 0, minWidth: 64, textAlign: "right" }}>
        {price === 0 ? (
          <span style={{ color: "#16a34a" }}>Free</span>
        ) : (
          `$${price.toFixed(2)}`
        )}
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: purpleLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={purple} strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="6" x2="21" y2="6" stroke={purple} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ margin: "0 0 10px", fontSize: 22, fontWeight: 900, color: purpleDark }}>
        Your cart is empty
      </h2>
      <p style={{ margin: "0 0 28px", fontSize: 14, color: "#6b7280", lineHeight: 1.7, maxWidth: 320 }}>
        Looks like you haven't added any courses yet. Browse our catalog and start learning today.
      </p>
      <Link
        to="/courses"
        style={{
          display: "inline-block",
          borderRadius: 999,
          padding: "13px 28px",
          fontSize: 14,
          fontWeight: 800,
          textDecoration: "none",
          color: "#fff",
          background: `linear-gradient(135deg, #8b6ef5, ${purple})`,
          boxShadow: "0 10px 24px rgba(95,73,153,0.25)",
        }}
      >
        Browse Courses
      </Link>
    </div>
  );
}

export default function CartPage() {
  const { cart, remove, clear } = useCart();
  const navigate = useNavigate();
  const [clearing, setClearing] = useState(false);

  const items = cart?.items || [];
  const subtotal = cart?.summary?.subtotal ?? 0;
  const itemCount = cart?.summary?.itemCount ?? 0;

  const handleClear = async () => {
    setClearing(true);
    await clear();
    setClearing(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5ff", paddingBottom: 60 }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)`,
          padding: "40px 24px 32px",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 6px" }}>
            Shopping Cart
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 14 }}>
            {itemCount === 0
              ? "Your cart is empty"
              : `${itemCount} course${itemCount !== 1 ? "s" : ""} in your cart`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "-20px auto 0", padding: "0 24px" }}>
        {items.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 4px 24px rgba(95,73,153,0.08)",
            }}
          >
            <EmptyCart />
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: 24,
              alignItems: "start",
            }}
          >
            {/* Cart items */}
            <div>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  boxShadow: "0 4px 24px rgba(95,73,153,0.08)",
                  overflow: "hidden",
                  marginBottom: 16,
                }}
              >
                {/* Table header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 24px",
                    borderBottom: "1px solid #f3f0fa",
                    background: "#faf8ff",
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 14, color: purpleDark }}>
                    {itemCount} Course{itemCount !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={handleClear}
                    disabled={clearing}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: clearing ? "not-allowed" : "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#6b7280",
                      opacity: clearing ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
                  >
                    {clearing ? "Clearing…" : "Clear all"}
                  </button>
                </div>

                {/* Items */}
                {items.map((item) => (
                  <CartItem
                    key={item._id || item.course?._id}
                    item={item}
                    onRemove={remove}
                  />
                ))}
              </div>

              {/* Keep shopping */}
              <Link
                to="/courses"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: purple,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={purple} strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div style={{ position: "sticky", top: 84 }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  boxShadow: "0 4px 24px rgba(95,73,153,0.1)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid #f3f0fa",
                    background: "#faf8ff",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: purpleDark }}>
                    Order Summary
                  </h3>
                </div>

                <div style={{ padding: "20px 22px" }}>
                  {/* Line items */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 14,
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    <span>Original Price</span>
                    <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                  </div>

                  <div
                    style={{
                      height: 1,
                      background: "#f3f0fa",
                      margin: "14px 0",
                    }}
                  />

                  {/* Total */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: 15, color: purpleDark }}>Total</span>
                    <span style={{ fontWeight: 900, fontSize: 22, color: purpleDark }}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Checkout button */}
                  <button
                    onClick={() => navigate("/checkout")}
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: 14,
                      padding: "14px 0",
                      fontSize: 15,
                      fontWeight: 800,
                      background: `linear-gradient(135deg, #8b6ef5, ${purple})`,
                      color: "#fff",
                      cursor: "pointer",
                      boxShadow: "0 10px 28px rgba(95,73,153,0.3)",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Proceed to Checkout
                  </button>

                  {/* Guarantee note */}
                  <p
                    style={{
                      margin: "14px 0 0",
                      fontSize: 11,
                      color: "#9ca3af",
                      textAlign: "center",
                      lineHeight: 1.5,
                    }}
                  >
                    30-day money-back guarantee
                  </p>
                </div>
              </div>

              {/* Wishlist link */}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Link
                  to="/wishlist"
                  style={{
                    fontSize: 13,
                    color: purple,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  View Wishlist
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
