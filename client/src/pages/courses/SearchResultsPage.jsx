import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getCourses } from "../../services/courseService";
import CourseCard from "../../components/course/CourseCard";

const purple = "#5f4999";
const purpleLight = "#ede9f8";

const LEVELS = ["all", "beginner", "intermediate", "advanced"];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("newest");
  const [inputVal, setInputVal] = useState(q);

  const navigate = useNavigate();

  const load = useCallback(async (query, lvl, srt, pg) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const params = { search: query, page: pg, limit: 12, sort: srt };
      if (lvl !== "all") params.level = lvl;
      const res = await getCourses(params);
      setCourses(res.data?.courses || []);
      setTotal(res.data?.pagination?.total || 0);
      setPages(res.data?.pagination?.pages || 1);
    } catch {
      toast.error("Search failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setInputVal(q);
    setPage(1);
    load(q, level, sort, 1);
  }, [q]);

  useEffect(() => {
    if (q) load(q, level, sort, page);
  }, [level, sort, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setPage(1);
    setSearchParams({ q: inputVal.trim() });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f9fa", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: "#1c1d1f", padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: "0 0 16px" }}>
            {q ? `Results for "${q}"` : "Search Courses"}
          </h1>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search courses…"
              style={{ flex: 1, padding: "12px 18px", borderRadius: 12, border: "none", fontSize: 15, outline: "none" }}
            />
            <button
              type="submit"
              style={{ padding: "12px 24px", background: "#5f4999", color: "#fff", border: "none", borderRadius: "0 4px 4px 0", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          {q && <span style={{ fontSize: 14, color: "#6b7280" }}>{total} result{total !== 1 ? "s" : ""}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid #e9e4f7", fontSize: 13, color: "#1a1a2e", background: "#fff", cursor: "pointer" }}
            >
              {LEVELS.map((l) => <option key={l} value={l}>{l === "all" ? "All Levels" : l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid #e9e4f7", fontSize: 13, color: "#1a1a2e", background: "#fff", cursor: "pointer" }}
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ width: 40, height: 40, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : !q ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <p style={{ color: "#9ca3af", fontSize: 15 }}>Type something above to search courses.</p>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>😕</div>
            <p style={{ color: "#9ca3af", fontSize: 15, fontWeight: 600 }}>No courses found for "{q}"</p>
            <p style={{ color: "#9ca3af", fontSize: 13 }}>Try different keywords or remove filters.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {courses.map((c) => <CourseCard key={c._id} course={c} />)}
            </div>
            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 18px", borderRadius: 10, border: `1.5px solid ${purpleLight}`, background: page === 1 ? "#f3f4f6" : "#fff", color: page === 1 ? "#9ca3af" : purple, fontWeight: 700, cursor: page === 1 ? "not-allowed" : "pointer" }}>‹ Prev</button>
                <span style={{ padding: "8px 18px", fontSize: 13, color: "#6b7280", alignSelf: "center" }}>{page} / {pages}</span>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} style={{ padding: "8px 18px", borderRadius: 10, border: `1.5px solid ${purpleLight}`, background: page === pages ? "#f3f4f6" : "#fff", color: page === pages ? "#9ca3af" : purple, fontWeight: 700, cursor: page === pages ? "not-allowed" : "pointer" }}>Next ›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
