import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getCourses } from "../../services/courseService";
import CourseCard from "../../components/course/CourseCard";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];
const LEVELS = ["all", "beginner", "intermediate", "advanced"];

const selectStyle = {
  padding: "8px 12px",
  borderRadius: 4,
  border: "1.5px solid #d1d7dc",
  fontSize: 13,
  color: "#1c1d1f",
  background: "#fff",
  cursor: "pointer",
  fontFamily: "inherit",
  outline: "none",
};

export default function CategoryPage() {
  const { category } = useParams();
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("newest");

  const label = category?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Category";

  const load = useCallback(async (cat, lvl, srt, pg) => {
    setLoading(true);
    try {
      const params = { category: cat, page: pg, limit: 12, sort: srt };
      if (lvl !== "all") params.level = lvl;
      const res = await getCourses(params);
      setCourses(res.data?.courses || []);
      setTotal(res.data?.pagination?.total || 0);
      setPages(res.data?.pagination?.pages || 1);
    } catch {
      toast.error("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setPage(1); load(category, level, sort, 1); }, [category]);
  useEffect(() => { if (category) load(category, level, sort, page); }, [level, sort, page]);

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #3c3168 0%, #5f4999 100%)", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Link to="/" style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontWeight: 500 }}>
            ← Home
          </Link>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "12px 0 6px", letterSpacing: "-0.025em" }}>
            {label}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, margin: 0 }}>
            {loading ? "Loading…" : `${total} course${total !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28, alignItems: "center" }}>
          <Link to="/courses" style={{ fontSize: 13, color: "#5f4999", fontWeight: 600, textDecoration: "none", borderBottom: "1px solid #5f4999", paddingBottom: 1 }}>
            All Courses
          </Link>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }} style={selectStyle}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l === "all" ? "All Levels" : l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} style={selectStyle}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <div style={{ width: 28, height: 28, border: "2px solid #e8e8e8", borderTopColor: "#5f4999", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ color: "#6a6f73", fontSize: 15, fontWeight: 500, margin: "0 0 16px" }}>
              No courses in this category yet.
            </p>
            <Link to="/courses" style={{ color: "#5f4999", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
              Browse all courses
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {courses.map((c) => <CourseCard key={c._id} course={c} />)}
            </div>
            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 40 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: "8px 16px", borderRadius: 4, border: "1.5px solid #d1d7dc", background: "#fff", color: page === 1 ? "#c0bfc4" : "#1c1d1f", fontWeight: 600, fontSize: 13, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                >
                  Prev
                </button>
                <span style={{ fontSize: 13, color: "#6a6f73", padding: "0 8px" }}>{page} / {pages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  style={{ padding: "8px 16px", borderRadius: 4, border: "1.5px solid #d1d7dc", background: "#fff", color: page === pages ? "#c0bfc4" : "#1c1d1f", fontWeight: 600, fontSize: 13, cursor: page === pages ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
