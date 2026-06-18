import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/authService";
import api from "../services/apiClient";
import { getMyEnrollments } from "../services/enrollmentService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null,
  );
  const [initializing, setInitializing] = useState(true);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());

  const applyToken = (token) => {
    if (token) {
      localStorage.setItem("accessToken", token);
      api.defaults.headers = api.defaults.headers || {};
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setAccessToken(token);
    } else {
      localStorage.removeItem("accessToken");
      if (api.defaults.headers) {
        delete api.defaults.headers.Authorization;
      }
      setAccessToken(null);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (accessToken) {
          api.defaults.headers = api.defaults.headers || {};
          api.defaults.headers.Authorization = `Bearer ${accessToken}`;
          const res = await authService.getMe();
          setUser(res.data.user);
        }
      } catch (err) {
        console.error(err);
        applyToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
  }, []);

  const refreshEnrollments = async () => {
    if (user && user.role === "student") {
      try {
        const res = await getMyEnrollments();
        const ids = new Set(
          (res.data?.enrollments || [])
            .map((e) => (e.course?._id || e.course)?.toString())
            .filter(Boolean)
        );
        setEnrolledCourseIds(ids);
      } catch (err) {
        console.error("Failed to refresh enrollments:", err);
      }
    } else {
      setEnrolledCourseIds(new Set());
    }
  };

  useEffect(() => {
    refreshEnrollments();
  }, [user]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const token = res.data.accessToken;
    applyToken(token);
    setUser(res.data.user);
    return res;
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    const token = res.data?.accessToken;
    if (token) {
      applyToken(token);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    applyToken(null);
    setUser(null);
  };

  const refreshSession = async () => {
    const res = await authService.refresh();
    applyToken(res.data.accessToken);
    const me = await authService.getMe();
    setUser(me.data.user);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        initializing,
        login,
        register,
        logout,
        refreshSession,
        setUser,
        enrolledCourseIds,
        refreshEnrollments,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
