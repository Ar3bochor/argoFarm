import API from "./api";

export const getCart = () => API.get("/cart");
export const addToCart = (productId, quantity = 1) => API.post("/cart", { productId, quantity });
export const updateCartItem = (productId, quantity) => API.put(`/cart/${productId}`, { quantity });
export const removeCartItem = (productId) => API.delete(`/cart/${productId}`);
export const clearCart = () => API.delete("/cart");
export const applyCoupon = (code) => API.post("/cart/coupon", { code });
