import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useChat } from "../../context/ChatContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { unreadCount } = useChat() || {};

  return (
    <nav className="p-4 bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold">
            SkillNest
          </Link>
          <Link to="/courses" className="text-sm text-gray-600">
            Courses
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user?.role === "admin" && (
            <>
              <Link to="/admin/dashboard" className="text-sm font-medium" style={{ color: "#5d4e98" }}>
                Dashboard
              </Link>
              <Link to="/admin/courses" className="text-sm font-medium" style={{ color: "#5d4e98" }}>
                Courses
              </Link>
              <Link to="/admin/users" className="text-sm font-medium" style={{ color: "#5d4e98" }}>
                Users
              </Link>
            </>
          )}

          {user?.role === "instructor" && (
            <>
              <Link to="/instructor/dashboard" className="text-sm font-medium" style={{ color: "#5d4e98" }}>
                Dashboard
              </Link>
              <Link to="/instructor/courses" className="text-sm" style={{ color: "#5d4e98" }}>
                My Courses
              </Link>
              <Link to="/instructor/analytics" className="text-sm" style={{ color: "#5d4e98" }}>
                Analytics
              </Link>
            </>
          )}

          {user?.role === "student" && (
            <>
              <Link to="/dashboard" className="text-sm font-medium" style={{ color: "#5d4e98" }}>
                Dashboard
              </Link>
              <Link to="/my-learning" className="text-sm font-medium" style={{ color: "#5d4e98" }}>
                My Learning
              </Link>
              <Link to="/wishlist" className="text-sm">
                Wishlist ({wishlist?.count || 0})
              </Link>
              <Link to="/cart" className="text-sm">
                Cart ({cart?.summary?.itemCount || 0})
              </Link>
            </>
          )}

          {user && (
            <Link
              to="/messages"
              style={{ position: "relative", fontSize: "1.2rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
              title="Messages"
            >
              💬
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -6,
                  background: "#5f4999", color: "#fff",
                  fontSize: 9, fontWeight: 800,
                  borderRadius: 99, padding: "1px 4px",
                  minWidth: 14, textAlign: "center",
                  lineHeight: "14px",
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <>
              <span className="text-sm text-gray-600">Hi, {user.name}</span>
              <button onClick={logout} className="text-sm text-red-500">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth/login" className="text-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
