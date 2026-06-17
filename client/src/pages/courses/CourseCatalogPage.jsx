import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getCourses } from "../../services/courseService";
import CourseCard from "../../components/course/CourseCard";

const LEVELS = ["all", "beginner", "intermediate", "advanced"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];
const CATEGORIES = [
  "All", "Development", "Business", "Design", "Marketing",
  "Data Science", "Photography", "Health", "Music",
];

export default function CourseCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const level = searchParams.get("level") || "all";
  const sort = searchParams.get("sort") || "newest";
  const category = searchParams.get("category") || "";

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "all" && value !== "All") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    setSearchParams(next);
    setPage(1);
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (level !== "all") params.level = level;
      if (category && category !== "All") params.category = category;
      const res = await getCourses(params);
      setCourses(res.data?.courses || []);
      setTotal(res.data?.total || 0);
    } catch {
      toast.error("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, [page, level, sort, category]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 600px) {
          .catalog-header { padding: 20px 16px !important; }
          .catalog-body { padding: 20px 16px !important; }
          .catalog-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; gap: 12px !important; }
          .catalog-filters { flex-direction: column !important; align-items: flex-start !important; }
          .catalog-sort-group { margin-left: 0 !important; width: 100%; display: flex; gap: 8px; }
          .catalog-sort-group select { flex: 1; }
        }
      `}</style>
      {/* Page header */}
      <div className="catalog-header" style={{ background: "#f7f9fa", borderBottom: "1px solid #e8e8e8", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: "#1c1d1f", margin: "0 0 4px" }}>
            All Courses
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#6a6f73" }}>
            {total > 0 ? `${total.toLocaleString()} courses available` : "Explore our course catalog"}
          </p>
        </div>
      </div>

      <div className="catalog-body" style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Filters */}
        <div
          className="catalog-filters"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom: "1px solid #e8e8e8",
          }}
        >
          {/* Category filter */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const isActive = cat === "All" ? !category : category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setParam("category", cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: `1.5px solid ${isActive ? "#5f4999" : "#d1d7dc"}`,
                    background: isActive ? "#5f4999" : "#fff",
                    color: isActive ? "#fff" : "#1c1d1f",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="catalog-sort-group" style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            {/* Level */}
            <select
              value={level}
              onChange={(e) => setParam("level", e.target.value)}
              style={{
                padding: "7px 12px",
                border: "1.5px solid #d1d7dc",
                borderRadius: 4,
                fontSize: 13,
                color: "#1c1d1f",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l === "all" ? "All Levels" : l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              style={{
                padding: "7px 12px",
                border: "1.5px solid #d1d7dc",
                borderRadius: 4,
                fontSize: 13,
                color: "#1c1d1f",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6a6f73" }}>
            Loading courses…
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ color: "#6a6f73", fontSize: 15, margin: 0 }}>
              No courses found for the selected filters.
            </p>
          </div>
        ) : (
          <div
            className="catalog-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 40 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "8px 16px",
                border: "1.5px solid #d1d7dc",
                borderRadius: 4,
                background: "#fff",
                color: page === 1 ? "#a3a8ae" : "#1c1d1f",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: "8px 14px",
                    border: `1.5px solid ${p === page ? "#5f4999" : "#d1d7dc"}`,
                    borderRadius: 4,
                    background: p === page ? "#5f4999" : "#fff",
                    color: p === page ? "#fff" : "#1c1d1f",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: "8px 16px",
                border: "1.5px solid #d1d7dc",
                borderRadius: 4,
                background: "#fff",
                color: page === totalPages ? "#a3a8ae" : "#1c1d1f",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
