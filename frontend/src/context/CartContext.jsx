import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as cartService from "../services/cartService";
import { getErrorMessage } from "../utils/helpers";
import useAuth from "../hooks/useAuth";

export const CartContext = createContext(null);

const emptyCart = { items: [], itemsPrice: 0, discountPrice: 0, totalPrice: 0 };

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setCart(emptyCart);
      return emptyCart;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await cartService.getCart();
      setCart(data || emptyCart);
      return data || emptyCart;
    } catch (err) {
      const message = getErrorMessage(err, "Unable to load cart");
      setError(message);
      return emptyCart;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, user?._id]);

  const addItem = async (productId, quantity = 1) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await cartService.addToCart(productId, quantity);
      setCart(data);
      return data;
    } catch (err) {
      const message = getErrorMessage(err, "Could not add item to cart");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    const { data } = await cartService.updateCartItem(productId, quantity);
    setCart(data);
    return data;
  };

  const removeItem = async (productId) => {
    const { data } = await cartService.removeCartItem(productId);
    setCart(data);
    return data;
  };

  const clear = async () => {
    const { data } = await cartService.clearCart();
    setCart(data || emptyCart);
    return data;
  };

  const applyCouponCode = async (code) => {
    const { data } = await cartService.applyCoupon(code);
    setCart(data);
    return data;
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  const value = useMemo(
    () => ({ cart, loading, error, itemCount, refreshCart, addItem, updateItem, removeItem, clear, applyCouponCode }),
    [cart, loading, error, itemCount, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
