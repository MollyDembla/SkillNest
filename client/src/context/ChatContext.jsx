import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getUnreadCount } from "../services/chatService";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace("/api/v1", "");

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { accessToken, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineStatus, setOnlineStatus] = useState({});

  useEffect(() => {
    if (!accessToken || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      setUnreadCount(0);
      return;
    }

    getUnreadCount()
      .then((res) => setUnreadCount(res.data?.unreadCount ?? 0))
      .catch(() => {});

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      console.warn("Socket connect error:", err.message);
      setConnected(false);
    });

    socket.on("new_unread", () => {
      setUnreadCount((c) => c + 1);
    });

    socket.on("user_status_changed", ({ userId, status }) => {
      setOnlineStatus((prev) => ({ ...prev, [userId]: status }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [accessToken, user]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const isOnline = useCallback(
    (userId) => onlineStatus[userId] === "online",
    [onlineStatus]
  );

  return (
    <ChatContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        unreadCount,
        setUnreadCount,
        clearUnread,
        isOnline,
        onlineStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
export default ChatContext;
