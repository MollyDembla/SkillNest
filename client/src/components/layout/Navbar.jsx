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

const navStyles = `
  .navbar-root {
    background: #fff;
    border-bottom: 1px solid #d1d7dc;
    position: sticky;
    top: 0;
    z-index: 200;
    height: 64px;
  }
  .navbar-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px;
    height: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .navbar-desktop-links {
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-left: auto;
  }
  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    color: #1c1d1f;
    border-radius: 4px;
    margin-left: auto;
  }
  .mobile-drawer {
    display: none;
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    z-index: 199;
    overflow-y: auto;
    padding: 16px;
    flex-direction: column;
    gap: 4px;
    border-top: 1px solid #d1d7dc;
  }
  .mobile-drawer.open {
    display: flex;
  }
  .mobile-link {
    display: block;
    padding: 14px 16px;
    font-size: 15px;
    font-weight: 600;
    color: #1c1d1f;
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.1s;
  }
  .mobile-link:hover {
    background: #f7f9fa;
  }
  .mobile-search-form {
    width: 100%;
    margin-bottom: 12px;
  }

  @media (max-width: 768px) {
    .navbar-inner {
      padding: 0 16px;
    }
    .navbar-desktop-links {
      display: none !important;
    }
    .navbar-search {
      display: none !important;
    }
    .mobile-menu-btn {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .navbar-icon-wishlist,
    .navbar-icon-cart,
    .navbar-icon-messages {
      display: none !important;
    }
    .navbar-right .auth-buttons {
      display: none;
    }
  }

  @media (min-width: 769px) {
    .mobile-drawer {
      display: none !important;
    }
    .mobile-menu-btn {
      display: none !important;
    }
  }

  @media (max-width: 1100px) {
    .navbar-desktop-links .nav-text-link {
      padding: 6px 7px;
      font-size: 13px;
    }
  }
`;

function NavIconButton({ to, badge, badgeColor = "#dc2626", title, children, className = "" }) {
  return (
    <Link
      to={to}
      title={title}
      className={className}
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

function NavTextLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className="nav-text-link"
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
  const [mobileOpen, setMobileOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setMobileOpen(false);
  };

  const cartCount = cart?.summary?.itemCount || 0;
  const wishlistCount = wishlist?.count || 0;
  const isAdmin = user?.role === "admin";

  const studentMobileLinks = user?.role === "student" ? [
    { to: "/dashboard", label: "📊 Dashboard" },
    { to: "/my-learning", label: "📚 My Learning" },
    { to: "/courses", label: "🔍 Browse Courses" },
    { to: "/wishlist", label: "❤️ Wishlist" },
    { to: "/cart", label: `🛒 Cart${cartCount > 0 ? ` (${cartCount})` : ""}` },
    { to: "/messages", label: "💬 Messages" },
    { to: "/profile", label: "👤 Profile" },
  ] : [];

  const instructorMobileLinks = user?.role === "instructor" ? [
    { to: "/instructor/dashboard", label: "📊 Dashboard" },
    { to: "/instructor/courses/create", label: "➕ Create Course" },
    { to: "/instructor/courses", label: "📖 My Courses" },
    { to: "/instructor/analytics", label: "📈 Analytics" },
    { to: "/courses", label: "🔍 Browse" },
    { to: "/messages", label: "💬 Messages" },
  ] : [];

  const adminMobileLinks = isAdmin ? ADMIN_LINKS.map(({ to, label }) => ({ to, label: `🔧 ${label}` })) : [];

  const mobileLinks = studentMobileLinks.length > 0
    ? studentMobileLinks
    : instructorMobileLinks.length > 0
    ? instructorMobileLinks
    : adminMobileLinks;

  return (
    <>
      <style>{navStyles}</style>
      <nav className="navbar-root">
        <div className="navbar-inner">

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
            <div ref={catRef} style={{ position: "relative", flexShrink: 0 }} className="navbar-desktop-links">
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
          <form onSubmit={handleSearch} className="navbar-search" style={{ flex: 1, maxWidth: isAdmin ? 360 : 520 }}>
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

          {/* Admin nav links */}
          {isAdmin && ADMIN_LINKS.map(({ to, label }) => (
            <NavTextLink key={to} to={to} active={location.pathname === to}>
              {label}
            </NavTextLink>
          ))}

          {/* Desktop nav links for non-admin */}
          {user && !isAdmin && (
            <div className="navbar-desktop-links" style={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            </div>
          )}

          {/* Right icons */}
          <div className="navbar-right">
            {user?.role === "student" && (
              <>
                <NavIconButton to="/wishlist" badge={wishlistCount} title="Wishlist" className="navbar-icon-wishlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </NavIconButton>
                <NavIconButton to="/cart" badge={cartCount} title="Cart" className="navbar-icon-cart">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 10a4 4 0 01-8 0" stroke="#1c1d1f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </NavIconButton>
              </>
            )}

            {user && !isAdmin && (
              <NavIconButton to="/messages" badge={unreadCount} badgeColor="#5f4999" title="Messages" className="navbar-icon-messages">
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
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            style={{ display: "block", padding: "9px 16px", fontSize: 14, color: "#1c1d1f", textDecoration: "none", fontWeight: 500, transition: "background 0.1s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Profile settings
                          </Link>
                        )}
                        {user.role === "instructor" && (
                          <Link
                            to="/instructor/profile"
                            onClick={() => setShowUserMenu(false)}
                            style={{ display: "block", padding: "9px 16px", fontSize: 14, color: "#1c1d1f", textDecoration: "none", fontWeight: 500, transition: "background 0.1s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f9fa")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            Profile settings
                          </Link>
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
              <div className="auth-buttons" style={{ display: "flex", gap: 8, marginLeft: 8 }}>
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

            {/* Mobile hamburger */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        {/* Mobile search */}
        <form onSubmit={handleSearch} className="mobile-search-form">
          <div style={{
            display: "flex", alignItems: "center",
            border: "1.5px solid #1c1d1f", borderRadius: 24,
            overflow: "hidden", background: "#fff", height: 44,
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
            <button type="submit" style={{
              background: "#1c1d1f", color: "#fff", border: "none",
              padding: "0 16px", height: "100%", cursor: "pointer",
              fontSize: 13, fontWeight: 600, borderRadius: "0 24px 24px 0",
            }}>
              Go
            </button>
          </div>
        </form>

        {/* Mobile nav links */}
        {user ? (
          <>
            {mobileLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="mobile-link" onClick={() => setMobileOpen(false)}>
                {label}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8 }}>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "14px 16px", background: "none", border: "none",
                  cursor: "pointer", fontSize: 15, color: "#dc2626",
                  fontWeight: 600, fontFamily: "inherit", borderRadius: 8,
                }}
              >
                🚪 Log out
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/courses" className="mobile-link" onClick={() => setMobileOpen(false)}>🔍 Browse Courses</Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat} to={`/category/${cat}`} className="mobile-link" onClick={() => setMobileOpen(false)}>
                {cat}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
              <Link to="/auth/login" className="mobile-link" onClick={() => setMobileOpen(false)}>Log in</Link>
              <Link
                to="/auth/register"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block", padding: "14px 16px", fontSize: 15, fontWeight: 700,
                  background: "#5f4999", color: "#fff", textDecoration: "none",
                  borderRadius: 8, textAlign: "center",
                }}
              >
                Sign up free
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
