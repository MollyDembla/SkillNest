import api from './apiClient';

export const getRecommendations = async (limit = 8) => {
  const res = await api.get('/ai/recommendations', { params: { limit } });
  return res.data;
};

export const checkAiHealth = async () => {
  const res = await api.get('/ai/health');
  return res.data;
};
