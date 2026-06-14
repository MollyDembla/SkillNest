import api from './apiClient';

export const getRooms = async () => {
  const res = await api.get('/chat/rooms');
  return res.data;
};

export const getOrCreateRoom = async (participantId) => {
  const res = await api.post('/chat/rooms', { participantId });
  return res.data;
};

export const getMessages = async (roomId, page = 1) => {
  const res = await api.get(`/chat/rooms/${roomId}/messages`, { params: { page } });
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get('/chat/unread-count');
  return res.data;
};
