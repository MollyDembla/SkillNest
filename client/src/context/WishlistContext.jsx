import React, { createContext, useContext, useEffect, useState } from "react";
import * as wishlistService from "../services/wishlistService";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);

  const load = async () => {
    try {
      const res = await wishlistService.getWishlist();
      setWishlist(res.data.wishlist);
    } catch (err) {
      setWishlist(null);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const add = async (courseId) => {
    const res = await wishlistService.addToWishlist(courseId);
    setWishlist(res.data.wishlist);
    return res;
  };

  const remove = async (courseId) => {
    const res = await wishlistService.removeFromWishlist(courseId);
    setWishlist(res.data.wishlist);
    return res;
  };

  const moveToCart = async (courseId) => {
    const res = await wishlistService.moveToCart(courseId);
    // response contains both wishlist and cart
    if (res.data && res.data.wishlist) setWishlist(res.data.wishlist);
    return res;
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, add, remove, moveToCart, reload: load }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);

export default WishlistContext;
