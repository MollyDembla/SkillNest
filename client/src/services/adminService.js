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
