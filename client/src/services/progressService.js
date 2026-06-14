import api from './apiClient';

export const getCourseProgress = async (courseId) => {
  const res = await api.get(`/progress/${courseId}`);
  return res.data;
};

export const markLessonComplete = async (courseId, lessonId) => {
  const res = await api.post(`/progress/${courseId}/lessons/${lessonId}/complete`);
  return res.data;
};
