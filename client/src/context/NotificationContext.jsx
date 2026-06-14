import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useChat } from "./ChatContext";
import { getUnreadCount } from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useChat() || {};
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (!user) { setUnreadNotifCount(0); return; }
    getUnreadCount()
      .then((res) => setUnreadNotifCount(res.data?.unreadCount ?? 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => setUnreadNotifCount((c) => c + 1);
    socket.on("new_notification", onNew);
    return () => socket.off("new_notification", onNew);
  }, [socket]);

  const clearUnreadNotif = useCallback(() => setUnreadNotifCount(0), []);

  return (
    <NotificationContext.Provider value={{ unreadNotifCount, setUnreadNotifCount, clearUnreadNotif }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
export default NotificationContext;
