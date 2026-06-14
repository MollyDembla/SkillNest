import api from "./apiClient";

export const getWishlist = async () => {
  const res = await api.get("/wishlist");
  return res.data;
};

export const addToWishlist = async (courseId) => {
  const res = await api.post("/wishlist/items", { courseId });
  return res.data;
};

export const removeFromWishlist = async (courseId) => {
  const res = await api.delete(`/wishlist/items/${courseId}`);
  return res.data;
};

export const clearWishlist = async () => {
  const res = await api.delete("/wishlist/clear");
  return res.data;
};

export const moveToCart = async (courseId) => {
  const res = await api.post(`/wishlist/${courseId}/move-to-cart`);
  return res.data;
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  moveToCart,
};
