import api from "./apiClient";

export const register = async (payload) => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const login = async (payload) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

export const refresh = async () => {
  const res = await api.post("/auth/refresh-token");
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/auth/logout");
  localStorage.removeItem("accessToken");
  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await api.get(`/auth/verify-email/${token}`);
  return res.data;
};

export const forgotPassword = async (payload) => {
  const res = await api.post("/auth/forgot-password", payload);
  return res.data;
};

export const resetPassword = async (token, payload) => {
  const res = await api.post(`/auth/reset-password/${token}`, payload);
  return res.data;
};

export default {
  register,
  login,
  refresh,
  getMe,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
