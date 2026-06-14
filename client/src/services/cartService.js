import api from "./apiClient";

export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

export const addToCart = async (courseId) => {
  const res = await api.post("/cart/items", { courseId });
  return res.data;
};

export const removeFromCart = async (courseId) => {
  const res = await api.delete(`/cart/items/${courseId}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete("/cart/clear");
  return res.data;
};

export const mergeCart = async (items = []) => {
  const res = await api.post("/cart/merge", { items });
  return res.data;
};

export default { getCart, addToCart, removeFromCart, clearCart, mergeCart };
