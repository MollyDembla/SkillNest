import api from './apiClient';

export const getDashboard = async () => {
  const res = await api.get('/admin/dashboard');
  return res.data;
};

export const getAdminCourses = async (params = {}) => {
  const res = await api.get('/admin/courses', { params });
  return res.data;
};

export const getAdminUsers = async (params = {}) => {
  const res = await api.get('/admin/users', { params });
  return res.data;
};

export const updateUserRole = async (userId, role) => {
  const res = await api.patch(`/admin/users/${userId}/role`, { role });
  return res.data;
};

export const deleteAdminUser = async (userId) => {
  const res = await api.delete(`/admin/users/${userId}`);
  return res.data;
};

export const approveCourse = async (courseId) => {
  const res = await api.patch(`/admin/courses/${courseId}/approve`);
  return res.data;
};

export const rejectCourse = async (courseId, reason) => {
  const res = await api.patch(`/admin/courses/${courseId}/reject`, { reason });
  return res.data;
};

export const getPlatformAnalytics = async (days = 30) => {
  const res = await api.get("/admin/analytics", { params: { days } });
  return res.data;
};
