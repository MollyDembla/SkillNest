import api from './apiClient';

export const getCourseReviews = async (courseId) => {
  const res = await api.get(`/reviews/course/${courseId}`);
  return res.data;
};

export const createReview = async (courseId, data) => {
  const res = await api.post(`/reviews/course/${courseId}`, data);
  return res.data;
};

export const deleteReview = async (reviewId) => {
  const res = await api.delete(`/reviews/${reviewId}`);
  return res.data;
};
