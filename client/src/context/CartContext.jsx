import React, { createContext, useContext, useEffect, useState } from "react";
import * as cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const load = async () => {
    try {
      const res = await cartService.getCart();
      setCart(res.data.cart);
    } catch (err) {
      setCart(null);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const add = async (courseId) => {
    const res = await cartService.addToCart(courseId);
    setCart(res.data.cart);
    return res;
  };

  const remove = async (courseId) => {
    const res = await cartService.removeFromCart(courseId);
    setCart(res.data.cart);
    return res;
  };

  const clear = async () => {
    const res = await cartService.clearCart();
    setCart(res.data.cart);
    return res;
  };

  return (
    <CartContext.Provider value={{ cart, add, remove, clear, reload: load }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
