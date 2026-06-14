import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useChat } from "../../context/ChatContext";
import { useNotification } from "../../context/NotificationContext";

const CATEGORIES = [
  "Development", "Business", "Design", "Marketing",
  "Data Science", "Photography", "Health", "Music",
];

const ADMIN_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/approvals", label: "Approvals" },
  { to: "/admin/analytics", label: "Analytics" },
];

const INSTRUCTOR_LINKS = [
  { to: "/instructor/dashboard", label: "Dashboard" },
  { to: "/instructor/courses/create", label: "Create Course" },
  { to: "/instructor/courses", label: "My Courses" },
  { to: "/instructor/analytics", label: "Analytics" },
  { to: "/courses", label: "Browse" },
];

function NavIconButton({ to, badge, badgeColor = "#dc2626", title, children }) {
  return (
    <Link
      to={to}
      title={title}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 4,
        color: "#1c1d1f",
        textDecoration: "none",
        fontSize: 18,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
      {badge > 0 && (
        <span style={{
          position: "absolute", top: 2, right: 2,
          background: badgeColor, color: "#fff",
          fontSize: 9, fontWeight: 800, borderRadius: 99,
          minWidth: 16, height: 16, display: "flex",
          alignItems: "center", justifyContent: "center",
          padding: "0 3px", lineHeight: 1, border: "1.5px solid #fff",
        }}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

function DropdownLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        display: "block", padding: "9px 16px", fontSize: 14,
        color: "#1c1d1f", textDecoration: "none", fontWeight: 500,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}

function NavTextLink({ to, children, active }) {
  return (
    <Link
      to={to}
      style={{
        fontSize: 14,
        color: active ? "#5f4999" : "#1c1d1f",
        textDecoration: "none",
        fontWeight: active ? 700 : 600,
        padding: "6px 10px",
        borderRadius: 4,
        borderBottom: active ? "2px solid #5f4999" : "2px solid transparent",
        transition: "background 0.1s",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { unreadCount } = useChat() || {};
  const { unreadNotifCount } = useNotification() || {};
  const [search, setSearch] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const catRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setShowCategories(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
  };

  const cartCount = cart?.summary?.itemCount || 0;
  const wishlistCount = wishlist?.count || 0;
  const isAdmin = user?.role === "admin";

  return (
    <nav style={{
      background: "#fff", borderBottom: "1px solid #d1d7dc",
      position: "sticky", top: 0, zIndex: 200, height: 64,
    }}>
      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "0 24px",
        height: "100%", display: "flex", alignItems: "center", gap: 8,
      }}>

        {/* Logo */}
        <Link to="/" style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 23, fontWeight: 700, fontStyle: "italic",
          color: "#5f4999", textDecoration: "none",
          flexShrink: 0, letterSpacing: "0.5px", marginRight: 8,
        }}>
          SkillNest
        </Link>

        {/* Explore dropdown — hidden for admin */}
        {!isAdmin && (
          <div ref={catRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setShowCategories((v) => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600, color: "#1c1d1f",
                padding: "6px 10px", borderRadius: 4,
                display: "flex", alignItems: "center", gap: 4, transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              Explore
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                style={{ transition: "transform 0.15s", transform: showCategories ? "rotate(180deg)" : "none" }}>
                <path d="M1 1l4 4 4-4" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showCategories && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0,
                background: "#fff", border: "1px solid #d1d7dc", borderRadius: 4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)", minWidth: 200, zIndex: 300,
              }}>
                {CATEGORIES.map((name) => (
                  <Link
                    key={name}
                    to={`/category/${name}`}
                    onClick={() => setShowCategories(false)}
                    style={{
                      display: "block", padding: "9px 16px", textDecoration: "none",
                      color: "#1c1d1f", fontSize: 14, fontWeight: 500,
                      borderBottom: "1px solid #f7f9fa", transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {name}
                  </Link>
                ))}
                <Link
                  to="/courses"
                  onClick={() => setShowCategories(false)}
                  style={{
                    display: "block", padding: "9px 16px", textDecoration: "none",
                    color: "#5f4999", fontSize: 13, fontWeight: 700, textAlign: "center",
                    borderTop: "1px solid #d1d7dc", transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Browse all courses
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: isAdmin ? 360 : 520 }}>
          <div style={{
            display: "flex", alignItems: "center",
            border: "1.5px solid #1c1d1f", borderRadius: 24,
            overflow: "hidden", background: "#fff", height: 40,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 14, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" stroke="#6a6f73" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="#6a6f73" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anything"
              style={{
                flex: 1, border: "none", outline: "none", fontSize: 14,
                color: "#1c1d1f", background: "transparent", padding: "0 12px", height: "100%",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#1c1d1f", color: "#fff", border: "none",
                padding: "0 20px", height: "100%", cursor: "pointer",
                fontSize: 13, fontWeight: 600, flexShrink: 0, borderRadius: "0 24px 24px 0",
              }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Admin nav links — shown in bar for admin */}
        {isAdmin && ADMIN_LINKS.map(({ to, label }) => (
          <NavTextLink key={to} to={to} active={location.pathname === to}>
            {label}
          </NavTextLink>
        ))}

        {/* Browse + student links — shown for logged-in non-admin */}
        {user && !isAdmin && (
          <>
            {user.role === "student" && (
              <NavTextLink to="/dashboard" active={location.pathname === "/dashboard"}>Dashboard</NavTextLink>
            )}
            {user.role === "student" && (
              <NavTextLink to="/my-learning" active={location.pathname === "/my-learning"}>My Learning</NavTextLink>
            )}
            {user.role === "student" && (
              <NavTextLink to="/courses" active={location.pathname === "/courses"}>Browse</NavTextLink>
            )}
            {user.role === "instructor" && INSTRUCTOR_LINKS.map(({ to, label }) => (
              <NavTextLink key={to} to={to} active={location.pathname === to || location.pathname.startsWith(to + "/")}>
                {label}
              </NavTextLink>
            ))}
          </>
        )}

        {/* Right action icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
          {/* Student-only icons */}
          {user?.role === "student" && (
            <>
              <NavIconButton to="/wishlist" badge={wishlistCount} title="Wishlist">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavIconButton>
              <NavIconButton to="/cart" badge={cartCount} title="Cart">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="3" y1="6" x2="21" y2="6" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M16 10a4 4 0 01-8 0" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavIconButton>
            </>
          )}



          {/* Messages — students and instructors only, not admin */}
          {user && !isAdmin && (
            <NavIconButton to="/messages" badge={unreadCount} badgeColor="#5f4999" title="Messages">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </NavIconButton>
          )}

          {/* Avatar + dropdown */}
          {user ? (
            <div ref={userRef} style={{ position: "relative", marginLeft: 6 }}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#5f4999", color: "#fff",
                  border: "2px solid #ede9f8", cursor: "pointer",
                  fontSize: 14, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                {user.avatar
                  ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  : user.name?.charAt(0).toUpperCase()}
              </button>

              {showUserMenu && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#fff", border: "1px solid #d1d7dc", borderRadius: 4,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)", minWidth: 240, zIndex: 300,
                }}>
                  {isAdmin ? (
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 13, color: "#1c1d1f", wordBreak: "break-all", fontWeight: 500 }}>{user.email}</div>
                    </div>
                  ) : (
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #e8e8e8" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1c1d1f" }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: "#6a6f73", marginTop: 2 }}>{user.email}</div>
                      <span style={{
                        display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 700,
                        background: user.role === "instructor" ? "#e0f2fe" : "#ede9f8",
                        color: user.role === "instructor" ? "#0369a1" : "#5f4999",
                        padding: "2px 8px", borderRadius: 4, textTransform: "capitalize",
                      }}>
                        {user.role}
                      </span>
                    </div>
                  )}

                  {!isAdmin && (
                    <div style={{ padding: "6px 0" }}>
                      {user.role === "student" && (
                        <DropdownLink to="/profile" onClick={() => setShowUserMenu(false)}>Profile settings</DropdownLink>
                      )}
                      {user.role === "instructor" && (
                        <>
                          <DropdownLink to="/instructor/profile" onClick={() => setShowUserMenu(false)}>Profile settings</DropdownLink>
                        </>
                      )}
                    </div>
                  )}

                  <div style={{ borderTop: "1px solid #e8e8e8", padding: "6px 0" }}>
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "9px 16px", background: "none", border: "none",
                        cursor: "pointer", fontSize: 14, color: "#dc2626",
                        fontWeight: 600, fontFamily: "inherit", transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
              <Link
                to="/auth/login"
                style={{
                  fontSize: 14, color: "#1c1d1f", textDecoration: "none", fontWeight: 700,
                  padding: "8px 14px", border: "1.5px solid #1c1d1f", borderRadius: 4,
                  lineHeight: 1, transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                Log in
              </Link>
              <Link
                to="/auth/register"
                style={{
                  fontSize: 14, background: "#1c1d1f", color: "#fff", textDecoration: "none",
                  fontWeight: 700, padding: "8px 16px", borderRadius: 4,
                  lineHeight: 1, transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#3c3168")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1c1d1f")}
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
