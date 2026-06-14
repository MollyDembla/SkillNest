import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCourses } from "../services/courseService";
import CourseCard from "../components/course/CourseCard";

const CATEGORIES = [
  { name: "Development", desc: "Web, mobile & software" },
  { name: "Business", desc: "Finance, management" },
  { name: "Design", desc: "UI, UX, graphic design" },
  { name: "Marketing", desc: "SEO, social media, growth" },
  { name: "Data Science", desc: "ML, AI, analytics" },
  { name: "Photography", desc: "Portraits, editing, video" },
  { name: "Health", desc: "Fitness, nutrition, wellness" },
  { name: "Music", desc: "Instruments, production" },
];

const STATS = [
  { value: "50,000+", label: "Students" },
  { value: "200+", label: "Courses" },
  { value: "98%", label: "Satisfaction" },
  { value: "40+", label: "Categories" },
];

const WHY = [
  {
    title: "Learn at your own pace",
    desc: "Access courses anytime, anywhere. Pick up where you left off on any device.",
  },
  {
    title: "Expert instructors",
    desc: "Learn from practitioners with real-world experience in their fields.",
  },
  {
    title: "Certificate on completion",
    desc: "Earn verifiable certificates to share on your resume and LinkedIn profile.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [popularCourses, setPopularCourses] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryCourses, setCategoryCourses] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const coursesRef = useRef(null);

  useEffect(() => {
    getCourses({ limit: 8, sort: "rating" })
      .then((res) => setPopularCourses(res.data?.courses || []))
      .catch(() => {})
      .finally(() => setPopularLoading(false));
  }, []);

  const handleCategoryClick = async (catName) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
      setCategoryCourses([]);
      return;
    }
    setSelectedCategory(catName);
    setCategoryLoading(true);
    setCategoryCourses([]);
    try {
      const res = await getCourses({ category: catName, limit: 12, sort: "rating" });
      setCategoryCourses(res.data?.courses || []);
    } catch {
      setCategoryCourses([]);
    } finally {
      setCategoryLoading(false);
      setTimeout(() => {
        coursesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg, #3c3168 0%, #5f4999 100%)", color: "#fff", padding: "80px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(30px, 5vw, 48px)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 0 16px",
              letterSpacing: "-0.03em",
            }}
          >
            Learn the skills that drive your career forward
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", margin: "0 0 36px", lineHeight: 1.65, fontWeight: 400 }}>
            Join thousands of students learning in-demand skills from expert instructors.
          </p>

          <form onSubmit={handleSearch} style={{ display: "flex", maxWidth: 520, margin: "0 auto" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What do you want to learn?"
              style={{
                flex: 1,
                padding: "15px 18px",
                fontSize: 15,
                border: "none",
                borderRadius: "4px 0 0 4px",
                outline: "none",
                color: "#1c1d1f",
                background: "#fff",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "15px 24px",
                background: "#3c3168",
                color: "#fff",
                border: "none",
                borderRadius: "0 4px 4px 0",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2150")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#3c3168")}
            >
              Search
            </button>
          </form>

          <div style={{ marginTop: 18, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
            {["Python", "React", "Machine Learning", "Data Science", "Design"].map((t, i) => (
              <span key={t}>
                <Link to={`/search?q=${t}`} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.3)" }}>
                  {t}
                </Link>
                {i < 4 && <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.25)" }}>·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: "#ede9f8", borderBottom: "1px solid #d8c4ff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px", display: "flex", justifyContent: "center", gap: "clamp(32px, 6vw, 96px)", flexWrap: "wrap" }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#3c3168", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#6a6f73", marginTop: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ padding: "56px 24px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1c1d1f", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Browse by category
            </h2>
            <p style={{ fontSize: 13, color: "#6a6f73", margin: 0 }}>Select a category to see courses</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  style={{
                    padding: "14px 16px",
                    background: isActive ? "#5f4999" : "#fff",
                    border: `1.5px solid ${isActive ? "#5f4999" : "#e8e8e8"}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "border-color 0.12s, background 0.12s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = "#5f4999"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = "#e8e8e8"; }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? "#fff" : "#1c1d1f", letterSpacing: "-0.01em" }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: 12, color: isActive ? "rgba(255,255,255,0.7)" : "#6a6f73", marginTop: 3, lineHeight: 1.4 }}>
                    {cat.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Category results ── */}
      {selectedCategory && (
        <section ref={coursesRef} style={{ padding: "0 24px 64px", background: "#fff", borderTop: "1px solid #e8e8e8" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "36px 0 28px", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1c1d1f", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                  {selectedCategory}
                </h2>
                {!categoryLoading && (
                  <p style={{ fontSize: 13, color: "#6a6f73", margin: 0 }}>
                    {categoryCourses.length === 0
                      ? "No courses in this category yet"
                      : `${categoryCourses.length} course${categoryCourses.length !== 1 ? "s" : ""}`}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <Link
                  to={`/courses?category=${selectedCategory}`}
                  style={{ fontSize: 13, color: "#5f4999", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #5f4999", paddingBottom: 1 }}
                >
                  View all
                </Link>
                <button
                  onClick={() => { setSelectedCategory(null); setCategoryCourses([]); }}
                  style={{ background: "none", border: "none", fontSize: 13, color: "#6a6f73", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500 }}
                >
                  Clear
                </button>
              </div>
            </div>

            {categoryLoading ? (
              <div style={{ padding: "48px 0", display: "flex", justifyContent: "center" }}>
                <div style={{ width: 24, height: 24, border: "2px solid #e8e8e8", borderTopColor: "#5f4999", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              </div>
            ) : categoryCourses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <p style={{ color: "#6a6f73", fontSize: 15, margin: "0 0 16px" }}>No published courses in {selectedCategory} yet.</p>
                <Link to="/auth/register" style={{ color: "#5f4999", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                  Become the first instructor
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {categoryCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Most popular courses ── */}
      <section style={{ padding: "56px 24px 64px", background: "#f7f9fa", borderTop: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1c1d1f", margin: 0, letterSpacing: "-0.02em" }}>
              Most popular
            </h2>
            <Link to="/courses" style={{ fontSize: 13, color: "#5f4999", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #5f4999", paddingBottom: 1 }}>
              Browse all
            </Link>
          </div>

          {popularLoading ? (
            <div style={{ padding: "60px 0", display: "flex", justifyContent: "center" }}>
              <div style={{ width: 24, height: 24, border: "2px solid #e8e8e8", borderTopColor: "#5f4999", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            </div>
          ) : popularCourses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ color: "#6a6f73", fontSize: 15, margin: "0 0 12px" }}>No courses published yet.</p>
              <Link to="/auth/register" style={{ color: "#5f4999", fontWeight: 700, textDecoration: "none" }}>
                Become an instructor
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {popularCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why SkillNest ── */}
      <section style={{ padding: "64px 24px", background: "#fff", borderTop: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1c1d1f", margin: "0 0 40px", letterSpacing: "-0.02em" }}>
            Why learners choose SkillNest
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 36 }}>
            {WHY.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 4,
                  background: "#5f4999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  flexShrink: 0,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}>
                  {i + 1}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#1c1d1f", letterSpacing: "-0.01em" }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#6a6f73", lineHeight: 1.65 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instructor CTA ── */}
      <section style={{ background: "linear-gradient(135deg, #3c3168 0%, #5f4999 100%)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 32 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Share your knowledge. Earn money.
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.65, maxWidth: 480 }}>
              Join our community of expert instructors. Create a course, reach thousands of students, and grow your income.
            </p>
          </div>
          <Link
            to="/auth/register"
            style={{
              flexShrink: 0,
              display: "inline-block",
              padding: "13px 24px",
              background: "#fff",
              color: "#5f4999",
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 4,
              textDecoration: "none",
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ede9f8")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            Start teaching
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#3c3168", color: "rgba(255,255,255,0.55)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>SkillNest</span>
          <span style={{ fontSize: 12 }}>© {new Date().getFullYear()} SkillNest. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Browse Courses", "/courses"], ["Log in", "/auth/login"], ["Sign up", "/auth/register"]].map(([label, to]) => (
              <Link key={to} to={to} style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
