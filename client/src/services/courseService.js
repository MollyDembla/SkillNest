import api from './apiClient';

export const getCourses = async (params = {}) => {
  const res = await api.get('/courses', { params });
  return res.data;
};

export const getCourseById = async (courseId) => {
  const res = await api.get(`/courses/${courseId}`);
  return res.data;
};

export const createCourse = async (data) => {
  const res = await api.post('/courses', data);
  return res.data;
};

export const updateCourse = async (courseId, data) => {
  const res = await api.put(`/courses/${courseId}`, data);
  return res.data;
};

export const deleteCourse = async (courseId) => {
  const res = await api.delete(`/courses/${courseId}`);
  return res.data;
};
