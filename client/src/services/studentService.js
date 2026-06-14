import api from './apiClient';

export const getDashboard = async () => {
  const res = await api.get('/students/dashboard');
  return res.data;
};
