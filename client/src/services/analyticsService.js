import api from './apiClient';

export const getInstructorAnalytics = async () => {
  const res = await api.get('/analytics/instructor');
  return res.data;
};
