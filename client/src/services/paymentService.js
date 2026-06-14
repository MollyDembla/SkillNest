import api from './apiClient';

export const createPaymentIntent = async () => {
  const res = await api.post('/payments/create-intent');
  return res.data;
};

export const confirmPayment = async (paymentIntentId) => {
  const res = await api.post('/payments/confirm', { paymentIntentId });
  return res.data;
};

export const getPaymentHistory = async () => {
  const res = await api.get('/payments/history');
  return res.data;
};
