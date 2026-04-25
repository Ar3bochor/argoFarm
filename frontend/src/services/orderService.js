// src/services/orderService.js
import API from "./api";

export const getMyOrders = () => API.get("/users/orders");
export const getOrders = getMyOrders;
export const createOrder = (data) => API.post("/orders", data);
