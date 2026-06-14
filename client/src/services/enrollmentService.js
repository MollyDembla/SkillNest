import api from './apiClient';

export const getMyEnrollments = async () => {
  const res = await api.get('/enrollments/my');
  return res.data;
};

export const checkEnrollment = async (courseId) => {
  const res = await api.get(`/enrollments/check/${courseId}`);
  return res.data;
};
