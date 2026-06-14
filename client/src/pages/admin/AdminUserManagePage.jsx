import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getAdminUsers, updateUserRole, deleteAdminUser } from "../../services/adminService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

// ─── constants ───────────────────────────────────────────────
const ROLE_TABS = [
  { key: "all", label: "All Users" },
  { key: "student", label: "Students" },
  { key: "instructor", label: "Instructors" },
  { key: "admin", label: "Admins" },
];

const ROLE_STYLE = {
  student:    { bg: purpleLight,  color: purple,     label: "Student" },
  instructor: { bg: "#e0f2fe",    color: "#0369a1",  label: "Instructor" },
  admin:      { bg: "#fee2e2",    color: "#991b1b",  label: "Admin" },
};

const ROLES = ["student", "instructor", "admin"];

// ─── role badge ──────────────────────────────────────────────
function RoleBadge({ role }) {
  const s = ROLE_STYLE[role] || ROLE_STYLE.student;
  return (
    <span
      style={{
        background: s.bg, color: s.color,
        fontSize: 11, fontWeight: 700,
        padding: "3px 10px", borderRadius: 99,
        textTransform: "capitalize", whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

// ─── avatar initials ─────────────────────────────────────────
function Avatar({ name, avatar, size = 36 }) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: purpleLight, color: purple,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.4, fontWeight: 800, flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}

// ─── change role modal ───────────────────────────────────────
function ChangeRoleModal({ user, onConfirm, onClose, loading }) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 18, padding: "30px 28px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <Avatar name={user.name} avatar={user.avatar} size={44} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1a1a2e" }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{user.email}</div>
          </div>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#374151" }}>
          Select a new role for this user:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {ROLES.map((role) => {
            const s = ROLE_STYLE[role];
            const active = selectedRole === role;
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderRadius: 12,
                  border: active ? `2px solid ${purple}` : "2px solid #e9e4f7",
                  background: active ? purpleLight : "#fff",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: active ? purple : "#d1d5db",
                      border: `2px solid ${active ? purple : "#d1d5db"}`,
                    }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e", textTransform: "capitalize" }}>
                    {role}
                  </span>
                </div>
                <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>
                  {role === "student" ? "Can buy & learn" : role === "instructor" ? "Can create courses" : "Full platform access"}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "#f3f4f6", color: "#374151",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedRole)}
            disabled={loading || selectedRole === user.role}
            style={{
              flex: 1, background: selectedRole === user.role ? "#e5e7eb" : purple,
              color: selectedRole === user.role ? "#9ca3af" : "#fff",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14,
              cursor: (loading || selectedRole === user.role) ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Updating…" : "Update Role"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── delete modal ─────────────────────────────────────────────
function DeleteModal({ user, onConfirm, onClose, loading }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 18, padding: "30px 28px",
          width: "100%", maxWidth: 420,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 12 }}>Delete User</div>
        <h2 style={{ margin: "0 0 8px", color: "#1a1a2e", fontSize: 18, fontWeight: 800 }}>
          Delete User
        </h2>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "#6b7280" }}>
          You are about to permanently delete:
        </p>
        <div
          style={{
            background: "#fef2f2", borderRadius: 10, padding: "12px 14px",
            marginBottom: 18, display: "flex", alignItems: "center", gap: 10,
          }}
        >
          <Avatar name={user.name} avatar={user.avatar} size={38} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{user.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{user.email} · <RoleBadge role={user.role} /></div>
          </div>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
          This cannot be undone. Their courses, enrollments, and data will remain but they won't be able to log in.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "#f3f4f6", color: "#374151",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, background: "#dc2626", color: "#fff",
              border: "none", borderRadius: 10, padding: "11px 0",
              fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Deleting…" : "Delete User"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── user row ─────────────────────────────────────────────────
function UserRow({ user, currentUserId, onChangeRole, onDelete, actionId }) {
  const busy = actionId === user._id;
  const isSelf = user._id === currentUserId;

  return (
    <tr style={{ borderBottom: "1px solid #f3f0fa" }}>
      {/* User info */}
      <td style={{ padding: "14px 16px", minWidth: 260 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={user.name} avatar={user.avatar} size={38} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                {user.name}
              </span>
              {isSelf && (
                <span style={{ background: purpleLight, color: purple, fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99 }}>
                  YOU
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
              {user.email}
            </div>
          </div>
        </div>
      </td>

      {/* Role */}
      <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
        <RoleBadge role={user.role} />
      </td>

      {/* Verified */}
      <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
        <span
          style={{
            fontSize: 11, fontWeight: 700,
            color: user.isEmailVerified ? "#16a34a" : "#d97706",
          }}
        >
          {user.isEmailVerified ? "Verified" : "Unverified"}
        </span>
      </td>

      {/* Stats */}
      <td style={{ padding: "14px 12px", fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>
        {user.role === "instructor" && (
          <span style={{ fontWeight: 600 }}>{user.courseCount} course{user.courseCount !== 1 ? "s" : ""}</span>
        )}
        {user.role === "student" && (
          <span style={{ fontWeight: 600 }}>{user.enrollmentCount} enrolled</span>
        )}
        {user.role === "admin" && (
          <span style={{ color: "#9ca3af" }}>—</span>
        )}
      </td>

      {/* Joined */}
      <td style={{ padding: "14px 12px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </td>

      {/* Actions */}
      <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={() => onChangeRole(user)}
            disabled={busy || isSelf}
            title={isSelf ? "Cannot change your own role" : "Change role"}
            style={{
              background: purpleLight, color: purple, border: "none",
              borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700,
              cursor: (busy || isSelf) ? "not-allowed" : "pointer",
              opacity: (busy || isSelf) ? 0.45 : 1,
            }}
          >
            Role
          </button>
          <button
            onClick={() => onDelete(user)}
            disabled={busy || isSelf}
            title={isSelf ? "Cannot delete your own account" : "Delete user"}
            style={{
              background: "#fee2e2", color: "#dc2626", border: "none",
              borderRadius: 7, padding: "5px 10px", fontSize: 11, fontWeight: 700,
              cursor: (busy || isSelf) ? "not-allowed" : "pointer",
              opacity: (busy || isSelf) ? 0.45 : 1,
            }}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── main page ────────────────────────────────────────────────
export default function AdminUserManagePage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getAdminUsers({
          role: activeTab === "all" ? undefined : activeTab,
          search: debouncedSearch || undefined,
          page,
          limit: 15,
        });
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } catch {
        toast.error("Failed to load users.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, debouncedSearch]
  );

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleRoleConfirm = async (newRole) => {
    if (!roleTarget) return;
    setModalLoading(true);
    try {
      await updateUserRole(roleTarget._id, newRole);
      toast.success(`${roleTarget.name}'s role changed to ${newRole}.`);
      setUsers((prev) =>
        prev.map((u) => u._id === roleTarget._id ? { ...u, role: newRole } : u)
      );
      setRoleTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setModalLoading(true);
    try {
      await deleteAdminUser(deleteTarget._id);
      toast.success(`${deleteTarget.name} has been deleted.`);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ background: "#f7f5ff", minHeight: "100vh", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #1e1340 0%, ${purpleDark} 50%, ${purple} 100%)` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 24px 48px" }}>
          <Link
            to="/admin/dashboard"
            style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}
          >
            ← Dashboard
          </Link>
          <h1 style={{ color: "#fff", margin: "8px 0 4px", fontSize: 24, fontWeight: 800 }}>
            User Management
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 13 }}>
            {pagination.total} user{pagination.total !== 1 ? "s" : ""} registered on the platform
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "-24px auto 0", padding: "0 24px" }}>
        {/* Search + filter card */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 20, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f0fa" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid #e9e4f7", borderRadius: 10,
                padding: "10px 14px", fontSize: 14, outline: "none",
                background: "#faf8ff", color: "#1a1a2e",
              }}
            />
          </div>

          <div style={{ display: "flex", padding: "0 20px", gap: 2, overflowX: "auto" }}>
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "12px 16px", border: "none",
                  borderBottom: activeTab === tab.key ? `3px solid ${purple}` : "3px solid transparent",
                  background: "none",
                  color: activeTab === tab.key ? purple : "#6b7280",
                  fontWeight: activeTab === tab.key ? 800 : 600,
                  fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "64px 24px", textAlign: "center" }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ width: 40, height: 40, border: `4px solid ${purpleLight}`, borderTop: `4px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
              <p style={{ color: "#6b7280", margin: 0 }}>Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: "64px 24px", textAlign: "center" }}>
              <h3 style={{ color: "#1a1a2e", margin: "0 0 6px" }}>No users found</h3>
              <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>
                {search ? "Try a different search term." : `No ${activeTab === "all" ? "" : activeTab + " "}users yet.`}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#faf8ff", borderBottom: "2px solid #f3f0fa" }}>
                    {["User", "Role", "Email Status", "Activity", "Joined", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px", textAlign: "left",
                          fontSize: 11, fontWeight: 800, color: "#6b7280",
                          textTransform: "uppercase", letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <UserRow
                      key={u._id}
                      user={u}
                      currentUserId={currentUser?._id || currentUser?.id}
                      onChangeRole={setRoleTarget}
                      onDelete={setDeleteTarget}
                      actionId={actionId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div style={{ padding: "16px 20px", borderTop: "1px solid #f3f0fa", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Page {pagination.page} of {pagination.pages} · {pagination.total} users
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => fetchUsers(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  style={{
                    background: pagination.page <= 1 ? "#f3f4f6" : purpleLight,
                    color: pagination.page <= 1 ? "#9ca3af" : purple,
                    border: "none", borderRadius: 8, padding: "8px 16px",
                    fontWeight: 700, fontSize: 13,
                    cursor: pagination.page <= 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => fetchUsers(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  style={{
                    background: pagination.page >= pagination.pages ? "#f3f4f6" : purpleLight,
                    color: pagination.page >= pagination.pages ? "#9ca3af" : purple,
                    border: "none", borderRadius: 8, padding: "8px 16px",
                    fontWeight: 700, fontSize: 13,
                    cursor: pagination.page >= pagination.pages ? "not-allowed" : "pointer",
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {roleTarget && (
        <ChangeRoleModal
          user={roleTarget}
          onConfirm={handleRoleConfirm}
          onClose={() => setRoleTarget(null)}
          loading={modalLoading}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
          loading={modalLoading}
        />
      )}
    </div>
  );
}
