import api from './apiClient';

export const getDashboard = async () => {
  const res = await api.get('/instructor/dashboard');
  return res.data;
};

export const getInstructorCourses = async (params = {}) => {
  const res = await api.get('/instructor/courses', { params });
  return res.data;
};

export const getInstructorCourse = async (courseId) => {
  const res = await api.get(`/instructor/courses/${courseId}`);
  return res.data;
};
