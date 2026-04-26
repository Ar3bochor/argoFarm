import API from "./api";

export const getOrders = () => API.get("/orders/my");
export const getMyOrders = () => API.get("/orders/my");
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const getOrderSummary = (data) => API.post("/orders/summary", data);
export const createOrder = (data) => API.post("/orders", data);
export const trackOrder = (id) => API.get(`/orders/${id}/track`);
export const reorder = (id) => API.post(`/orders/${id}/reorder`);
