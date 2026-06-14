import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useNotification } from "../../context/NotificationContext";
import {
  getNotifications, markAsRead, markAllAsRead, deleteNotification,
} from "../../services/notificationService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

const TYPE_ICON = {
  enrollment: "🎓",
  payment: "💳",
  review: "⭐",
  chat: "💬",
  course_status: "📋",
  system: "🔔",
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { setUnreadNotifCount } = useNotification() || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await getNotifications(pg);
      const list = res.data?.notifications || [];
      setNotifications((prev) => (pg === 1 ? list : [...prev, ...list]));
      setHasMore(res.data?.pagination?.hasMore || false);
      if (pg === 1) setUnreadNotifCount?.(0);
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [setUnreadNotifCount]);

  useEffect(() => { load(1); }, [load]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifCount?.(0);
      toast.success("All marked as read.");
    } catch {
      toast.error("Failed.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleClick = async (n) => {
    if (!n.isRead) await handleMarkRead(n._id);
    if (n.link) navigate(n.link);
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5ff", paddingBottom: 60 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${purpleDark} 0%, ${purple} 100%)`, padding: "40px 24px 32px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 900, margin: 0 }}>Notifications</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", margin: "6px 0 0", fontSize: 14 }}>
            {unread > 0 ? `${unread} unread` : "All caught up!"}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
        {notifications.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button
              onClick={handleMarkAll}
              style={{
                background: "none", border: `1.5px solid ${purple}`, color: purple,
                borderRadius: 10, padding: "6px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              ✓ Mark all read
            </button>
          </div>
        )}

        {loading && notifications.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ width: 40, height: 40, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔔</div>
            <p style={{ color: "#9ca3af", fontSize: 15, fontWeight: 600 }}>No notifications yet</p>
            <p style={{ color: "#9ca3af", fontSize: 13 }}>Course updates, messages, and more will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{
                  background: n.isRead ? "#fff" : "#f3f0fa",
                  borderRadius: 16, padding: "16px 18px",
                  display: "flex", gap: 14, alignItems: "flex-start",
                  cursor: n.link ? "pointer" : "default",
                  border: n.isRead ? "1.5px solid #f0edf8" : `1.5px solid ${purpleLight}`,
                  boxShadow: n.isRead ? "none" : "0 2px 12px rgba(95,73,153,0.08)",
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: n.isRead ? "#f3f4f6" : purpleLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                }}>
                  {TYPE_ICON[n.type] || "🔔"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#1a1a2e", lineHeight: 1.5, fontWeight: n.isRead ? 400 : 600 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, display: "block" }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {!n.isRead && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                      title="Mark as read"
                      style={{ background: "none", border: "none", cursor: "pointer", color: purple, fontSize: 16, padding: "4px 8px", borderRadius: 8 }}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                    title="Delete"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14, padding: "4px 8px", borderRadius: 8 }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              onClick={() => { const next = page + 1; setPage(next); load(next); }}
              disabled={loading}
              style={{
                background: purpleLight, color: purple, border: "none",
                borderRadius: 12, padding: "10px 28px", fontWeight: 700, cursor: "pointer", fontSize: 14,
              }}
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
