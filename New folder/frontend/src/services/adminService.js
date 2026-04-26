import API from "./api";

export const getDashboardStats = () => API.get("/admin/dashboard");
export const getUsers = () => API.get("/admin/users");
export const getAllOrders = () => API.get("/admin/orders");
export const updateOrderStatus = (id, data) => API.put(`/admin/orders/${id}/status`, data);
export const getSalesReport = (params = {}) => API.get("/admin/reports/sales", { params });
export const getAllReviews = (params = {}) => API.get("/reviews", { params });
export const approveReview = (id) => API.put(`/reviews/${id}/approve`);
export const rejectReview = (id) => API.put(`/reviews/${id}/reject`);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
