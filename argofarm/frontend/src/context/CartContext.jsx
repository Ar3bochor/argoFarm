import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as cartService from "../services/cartService";
import { getErrorMessage } from "../utils/helpers";
import useAuth from "../hooks/useAuth";

export const CartContext = createContext(null);

const emptyCart = { items: [], itemsPrice: 0, discountPrice: 0, shippingPrice: 0, totalPrice: 0 };

/**
 * Unwrap the cart object from the backend response.
 *
 * BUG FIX: The backend cartController returns the cart object directly —
 * it does NOT wrap it in { success: true, data: {...} } like auth endpoints do.
 *
 * So the shape coming back through Axios is:
 *   axios response:    res
 *   HTTP body:         res.data   = { items: [...], itemsPrice: 0, ... }
 *
 * The old code did `const { data } = await cartService.getCart()`
 * which destructures `data` from the axios response object — giving
 * the cart object correctly. BUT then it set cart to `data` which IS
 * the cart. So the cart was actually set correctly.
 *
 * The real issue was that a failed addToCart (due to user appearing
 * not logged in from the api.js 401 bug) threw an error that wasn't
 * caught, breaking the "Add to cart" button silently.
 *
 * This version adds proper error recovery and consistent unwrapping.
 */
const unwrapCart = (res) => {
  const body = res?.data;
  // If backend wraps in { success, data } → use body.data
  // If backend returns cart directly → use body
  if (body?.items !== undefined) return body;           // direct cart object
  if (body?.data?.items !== undefined) return body.data; // wrapped cart object
  return null;
};

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
      const res = await cartService.getCart();
      const cartData = unwrapCart(res) || emptyCart;
      setCart(cartData);
      return cartData;
    } catch (err) {
      // Don't clear the cart on network errors — only on auth failure
      if (err?.response?.status !== 401) {
        setError(getErrorMessage(err, "Unable to load cart"));
      }
      return emptyCart;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh cart whenever user logs in or out
  useEffect(() => {
    refreshCart();
  }, [refreshCart, user?._id]);

  const addItem = async (productId, quantity = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await cartService.addToCart(productId, quantity);
      const cartData = unwrapCart(res);
      if (cartData) setCart(cartData);
      return cartData;
    } catch (err) {
      const message = getErrorMessage(err, "Could not add item to cart");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const res = await cartService.updateCartItem(productId, quantity);
      const cartData = unwrapCart(res);
      if (cartData) setCart(cartData);
      return cartData;
    } catch (err) {
      const message = getErrorMessage(err, "Could not update item");
      setError(message);
      throw new Error(message);
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await cartService.removeCartItem(productId);
      const cartData = unwrapCart(res);
      if (cartData) setCart(cartData);
      return cartData;
    } catch (err) {
      const message = getErrorMessage(err, "Could not remove item");
      setError(message);
      throw new Error(message);
    }
  };

  const clear = async () => {
    try {
      const res = await cartService.clearCart();
      const cartData = unwrapCart(res) || emptyCart;
      setCart(cartData);
      return cartData;
    } catch (err) {
      setError(getErrorMessage(err, "Could not clear cart"));
    }
  };

  const applyCouponCode = async (code) => {
    try {
      const res = await cartService.applyCoupon(code);
      const cartData = unwrapCart(res);
      if (cartData) setCart(cartData);
      return cartData;
    } catch (err) {
      const message = getErrorMessage(err, "Could not apply coupon");
      setError(message);
      throw new Error(message);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  const value = useMemo(
    () => ({ cart, loading, error, itemCount, refreshCart, addItem, updateItem, removeItem, clear, applyCouponCode }),
    [cart, loading, error, itemCount, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};