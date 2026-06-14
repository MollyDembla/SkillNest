import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useChat } from "../../context/ChatContext";
import { useNotification } from "../../context/NotificationContext";

const purple = "#5f4999";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { unreadCount } = useChat() || {};
  const { unreadNotifCount } = useNotification() || {};
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  return (
    <nav style={{ background: "#fff", boxShadow: "0 1px 8px rgba(95,73,153,0.08)", padding: "10px 20px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
        {/* Logo */}
        <Link to="/" style={{ fontSize: 20, fontWeight: 900, color: purple, textDecoration: "none", flexShrink: 0 }}>
          SkillNest
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, display: "flex", gap: 0 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            style={{ flex: 1, padding: "8px 14px", border: "1.5px solid #e9e4f7", borderRight: "none", borderRadius: "10px 0 0 10px", fontSize: 13, outline: "none", background: "#faf8ff", color: "#1a1a2e" }}
          />
          <button type="submit" style={{ padding: "8px 14px", background: purple, color: "#fff", border: "none", borderRadius: "0 10px 10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            🔍
          </button>
        </form>

        {/* Browse */}
        <Link to="/courses" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
          Browse
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto" }}>
          {/* Admin links */}
          {user?.role === "admin" && (
            <>
              <Link to="/admin/dashboard" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>Dashboard</Link>
              <Link to="/admin/approvals" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>Approvals</Link>
              <Link to="/admin/analytics" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>Analytics</Link>
              <Link to="/admin/users" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>Users</Link>
            </>
          )}

          {/* Instructor links */}
          {user?.role === "instructor" && (
            <>
              <Link to="/instructor/dashboard" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>Dashboard</Link>
              <Link to="/instructor/courses" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>My Courses</Link>
              <Link to="/instructor/analytics" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>Analytics</Link>
            </>
          )}

          {/* Student links */}
          {user?.role === "student" && (
            <>
              <Link to="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>Dashboard</Link>
              <Link to="/my-learning" style={{ fontSize: 13, fontWeight: 600, color: purple, textDecoration: "none" }}>My Learning</Link>
              <Link to="/wishlist" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
                ♡ {wishlist?.count > 0 ? wishlist.count : ""}
              </Link>
              <Link to="/cart" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
                🛒 {cart?.summary?.itemCount > 0 ? cart.summary.itemCount : ""}
              </Link>
            </>
          )}

          {/* Notification bell */}
          {user && (
            <Link
              to="/notifications"
              style={{ position: "relative", fontSize: "1.1rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              title="Notifications"
            >
              🔔
              {unreadNotifCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -6, background: "#dc2626", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 99, padding: "1px 4px", minWidth: 14, textAlign: "center", lineHeight: "14px" }}>
                  {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                </span>
              )}
            </Link>
          )}

          {/* Messages */}
          {user && (
            <Link
              to="/messages"
              style={{ position: "relative", fontSize: "1.1rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              title="Messages"
            >
              💬
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -6, background: purple, color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 99, padding: "1px 4px", minWidth: 14, textAlign: "center", lineHeight: "14px" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User menu */}
          {user ? (
            <>
              <Link
                to={user.role === "student" ? "/profile" : user.role === "instructor" ? "/instructor/profile" : "#"}
                style={{ fontSize: 13, color: "#374151", textDecoration: "none", fontWeight: 600 }}
              >
                {user.name?.split(" ")[0]}
              </Link>
              <button
                onClick={logout}
                style={{ fontSize: 13, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: 0 }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth/login" style={{ fontSize: 13, color: "#374151", textDecoration: "none", fontWeight: 600 }}>Login</Link>
              <Link
                to="/auth/register"
                style={{ fontSize: 13, background: purple, color: "#fff", textDecoration: "none", fontWeight: 700, padding: "7px 16px", borderRadius: 10 }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
