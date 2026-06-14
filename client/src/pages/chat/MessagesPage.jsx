import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { getRooms, getMessages } from "../../services/chatService";

const purple = "#5f4999";
const purpleDark = "#3c3168";
const purpleLight = "#ede9f8";

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDateLabel(date) {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
}

function Avatar({ user, size = 36, showOnline, online }) {
  const initial = user?.name?.charAt(0).toUpperCase() || "?";
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: size, height: size, borderRadius: "50%",
          background: purpleLight, color: purple,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.38, fontWeight: 800, overflow: "hidden",
        }}
      >
        {user?.avatar
          ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initial}
      </div>
      {showOnline && (
        <div style={{
          position: "absolute", bottom: 0, right: 0,
          width: 10, height: 10, borderRadius: "50%",
          background: online ? "#16a34a" : "#d1d5db",
          border: "2px solid #fff",
        }} />
      )}
    </div>
  );
}

function RoomItem({ room, selected, currentUserId, isOnline, onClick }) {
  const other = room.participants.find((p) => p._id !== currentUserId);
  const online = isOnline(other?._id);
  const lastMsg = room.lastMessage;
  const preview = lastMsg
    ? `${lastMsg.sender?._id === currentUserId ? "You: " : ""}${lastMsg.text || "📎 Media"}`
    : "No messages yet";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", gap: 12, alignItems: "center",
        padding: "12px 16px", cursor: "pointer",
        background: selected ? purpleLight : "transparent",
        borderLeft: selected ? `3px solid ${purple}` : "3px solid transparent",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "#f7f5ff"; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      <Avatar user={other} showOnline online={online} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontWeight: selected ? 800 : 700, fontSize: 14, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {other?.name || "Unknown"}
          </span>
          <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>
            {lastMsg ? timeAgo(lastMsg.createdAt) : ""}
          </span>
        </div>
        {room.course && (
          <div style={{ fontSize: 11, color: purple, fontWeight: 600, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            📚 {room.course.title}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, marginTop: 2 }}>
          <span style={{
            fontSize: 12,
            color: room.unread > 0 ? "#374151" : "#9ca3af",
            fontWeight: room.unread > 0 ? 600 : 400,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {preview}
          </span>
          {room.unread > 0 && (
            <span style={{ background: purple, color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 99, padding: "1px 6px", flexShrink: 0 }}>
              {room.unread > 9 ? "9+" : room.unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMine, showAvatar, prevMsg }) {
  const showDate = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt);
  return (
    <>
      {showDate && (
        <div style={{ textAlign: "center", margin: "16px 0 8px" }}>
          <span style={{ fontSize: 11, color: "#9ca3af", background: "#f3f0fa", padding: "3px 12px", borderRadius: 99, fontWeight: 600 }}>
            {formatDateLabel(msg.createdAt)}
          </span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
        {!isMine && (
          <div style={{ width: 28, flexShrink: 0 }}>
            {showAvatar && <Avatar user={msg.sender} size={28} />}
          </div>
        )}
        <div style={{
          maxWidth: "68%",
          background: isMine ? purple : "#fff",
          color: isMine ? "#fff" : "#1a1a2e",
          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "9px 14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          wordBreak: "break-word",
        }}>
          <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{msg.text}</div>
          <div style={{ fontSize: 10, marginTop: 3, color: isMine ? "rgba(255,255,255,0.6)" : "#9ca3af", textAlign: "right" }}>
            {formatTime(msg.createdAt)}
          </div>
        </div>
      </div>
    </>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", background: "#fff", borderRadius: "18px 18px 18px 4px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", width: "fit-content" }}>
      <style>{`@keyframes typingBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}`}</style>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9ca3af", animation: `typingBounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
    </div>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, connected, setUnreadCount, isOnline } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const prevRoomRef = useRef(null);

  // Load rooms
  const loadRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const res = await getRooms();
      setRooms(res.data.rooms || []);
    } catch {
      toast.error("Failed to load conversations.");
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  // Load messages
  const loadMessages = useCallback(async (roomId, pg = 1) => {
    setMsgLoading(true);
    try {
      const res = await getMessages(roomId, pg);
      const newMsgs = res.data.messages || [];
      setMessages((prev) => pg === 1 ? newMsgs : [...newMsgs, ...prev]);
      setHasMore(res.data.pagination?.hasMore || false);
    } catch {
      toast.error("Failed to load messages.");
    } finally {
      setMsgLoading(false);
    }
  }, []);

  // Select room
  const selectRoom = useCallback((roomId) => {
    if (prevRoomRef.current && socket) {
      socket.emit("leave_room", prevRoomRef.current);
    }
    setSelectedRoomId(roomId);
    setMessages([]);
    setPage(1);
    setHasMore(false);
    setText("");
    setIsTyping(false);
    prevRoomRef.current = roomId;

    if (socket && connected) socket.emit("join_room", roomId);
    loadMessages(roomId, 1);

    // Clear unread locally
    setRooms((prev) =>
      prev.map((r) => (r._id === roomId ? { ...r, unread: 0 } : r))
    );
    setUnreadCount((c) => {
      const room = rooms.find((r) => r._id === roomId);
      return Math.max(0, c - (room?.unread || 0));
    });

    setTimeout(() => inputRef.current?.focus(), 100);
  }, [socket, connected, loadMessages, rooms, setUnreadCount]);

  // Auto-select room from ?room= param
  useEffect(() => {
    const roomParam = searchParams.get("room");
    if (!roomParam || rooms.length === 0) return;
    selectRoom(roomParam);
    setSearchParams({}, { replace: true });
  }, [searchParams, rooms]);

  // Re-join on reconnect
  useEffect(() => {
    if (connected && selectedRoomId && socket) {
      socket.emit("join_room", selectedRoomId);
    }
  }, [connected, selectedRoomId, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      const msgRoomId = msg.chatRoom?._id || msg.chatRoom;
      if (msgRoomId === selectedRoomId) {
        setMessages((prev) => [...prev, msg]);
      }
      setRooms((prev) =>
        prev.map((r) => r._id === msgRoomId ? { ...r, lastMessage: msg, updatedAt: msg.createdAt } : r)
      );
    };

    const onUserTyping = ({ roomId, userId }) => {
      if (roomId === selectedRoomId && userId !== user._id) setIsTyping(true);
    };

    const onUserStopTyping = ({ roomId }) => {
      if (roomId === selectedRoomId) setIsTyping(false);
    };

    const onNewUnread = ({ roomId }) => {
      if (roomId !== selectedRoomId) {
        setRooms((prev) =>
          prev.map((r) => r._id === roomId ? { ...r, unread: (r.unread || 0) + 1 } : r)
        );
      }
    };

    socket.on("new_message", onNewMessage);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);
    socket.on("new_unread", onNewUnread);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
      socket.off("new_unread", onNewUnread);
    };
  }, [socket, selectedRoomId, user._id]);

  // Scroll to bottom
  useEffect(() => {
    if (page === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, page]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !selectedRoomId || !socket || !connected) return;
    socket.emit("send_message", { roomId: selectedRoomId, text: trimmed });
    setText("");
    socket.emit("stop_typing", { roomId: selectedRoomId });
    clearTimeout(typingTimerRef.current);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!socket || !selectedRoomId || !connected) return;
    socket.emit("typing", { roomId: selectedRoomId });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId: selectedRoomId });
    }, 2500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMessages(selectedRoomId, nextPage);
  };

  const filteredRooms = rooms.filter((room) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const other = room.participants.find((p) => p._id !== user._id);
    return (
      other?.name?.toLowerCase().includes(q) ||
      room.course?.title?.toLowerCase().includes(q)
    );
  });

  const selectedRoom = rooms.find((r) => r._id === selectedRoomId);
  const otherUser = selectedRoom?.participants.find((p) => p._id !== user._id);
  const isOtherOnline = isOnline(otherUser?._id);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", background: "#f7f5ff", overflow: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes typingBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-4px)} }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{ width: 320, flexShrink: 0, background: "#fff", borderRight: "1px solid #f3f0fa", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid #f3f0fa" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: purpleDark }}>Messages</h2>
            <div
              style={{ width: 8, height: 8, borderRadius: "50%", background: connected ? "#16a34a" : "#d1d5db" }}
              title={connected ? "Connected" : "Connecting…"}
            />
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#9ca3af" }}>🔍</span>
            <input
              type="text"
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 10px 8px 30px", border: "1.5px solid #e9e4f7", borderRadius: 10, fontSize: 13, color: "#1a1a2e", background: "#faf8ff", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {roomsLoading ? (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
              <div style={{ width: 32, height: 32, border: `3px solid ${purpleLight}`, borderTop: `3px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>
                {search ? "No conversations match." : "No conversations yet.\nMessage an instructor from a course page to get started."}
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <RoomItem
                key={room._id}
                room={room}
                selected={room._id === selectedRoomId}
                currentUserId={user._id}
                isOnline={isOnline}
                onClick={() => selectRoom(room._id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Thread ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {!selectedRoomId ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#9ca3af" }}>
            <div style={{ fontSize: 56 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: purpleDark }}>Select a conversation</div>
            <div style={{ fontSize: 13, textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
              Pick a conversation from the left, or start one from a course page.
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #f3f0fa", background: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar user={otherUser} size={40} showOnline online={isOtherOnline} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a2e" }}>{otherUser?.name || "—"}</div>
                <div style={{ fontSize: 12, color: isOtherOnline ? "#16a34a" : "#9ca3af", fontWeight: 600 }}>
                  {isOtherOnline ? "Online" : "Offline"}
                  {otherUser?.role && (
                    <span style={{ marginLeft: 6, color: "#9ca3af", fontWeight: 400, textTransform: "capitalize" }}>
                      · {otherUser.role}
                    </span>
                  )}
                </div>
                {selectedRoom?.course && (
                  <div style={{ fontSize: 11, color: purple, fontWeight: 600, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    📚 {selectedRoom.course.title}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              {hasMore && (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <button
                    onClick={loadMore}
                    disabled={msgLoading}
                    style={{ background: purpleLight, color: purple, border: "none", borderRadius: 99, padding: "6px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    {msgLoading ? "Loading…" : "↑ Load older messages"}
                  </button>
                </div>
              )}

              {msgLoading && messages.length === 0 && (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
                  <div style={{ width: 36, height: 36, border: `3px solid ${purpleLight}`, borderTop: `3px solid ${purple}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
              )}

              {messages.length === 0 && !msgLoading && (
                <div style={{ textAlign: "center", paddingTop: 60, color: "#9ca3af", fontSize: 13 }}>
                  No messages yet. Say hello! 👋
                </div>
              )}

              {messages.map((msg, i) => {
                const senderId = msg.sender?._id || msg.sender;
                const isMine = senderId === user._id;
                const prevSenderId = messages[i - 1]?.sender?._id || messages[i - 1]?.sender;
                const showAvatar = !isMine && prevSenderId !== senderId;
                return (
                  <MessageBubble
                    key={msg._id}
                    msg={msg}
                    isMine={isMine}
                    showAvatar={showAvatar}
                    prevMsg={messages[i - 1]}
                  />
                );
              })}

              {isTyping && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 4 }}>
                  <Avatar user={otherUser} size={28} />
                  <TypingIndicator />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f3f0fa", background: "#fff", display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={text}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={connected ? "Message… (Enter to send)" : "Connecting…"}
                disabled={!connected}
                rows={1}
                style={{
                  flex: 1, padding: "10px 14px",
                  border: "1.5px solid #e9e4f7", borderRadius: 14,
                  fontSize: 14, color: "#1a1a2e", background: connected ? "#faf8ff" : "#f3f4f6",
                  outline: "none", resize: "none", fontFamily: "inherit",
                  lineHeight: 1.5, maxHeight: 120, overflowY: "auto",
                  boxSizing: "border-box",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || !connected}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: text.trim() && connected ? purple : "#e9e4f7",
                  color: text.trim() && connected ? "#fff" : "#9ca3af",
                  border: "none",
                  cursor: text.trim() && connected ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
