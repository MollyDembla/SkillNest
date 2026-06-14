import api from './apiClient';

export const getLessons = async (courseId) => {
  const res = await api.get(`/lessons/course/${courseId}`);
  return res.data;
};

export const addLesson = async (courseId, data) => {
  const res = await api.post(`/lessons/course/${courseId}`, data);
  return res.data;
};

export const updateLesson = async (lessonId, data) => {
  const res = await api.put(`/lessons/${lessonId}`, data);
  return res.data;
};

export const deleteLesson = async (lessonId) => {
  const res = await api.delete(`/lessons/${lessonId}`);
  return res.data;
};
