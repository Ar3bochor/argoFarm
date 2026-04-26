import API from "./api";

export const getProducts    = (params) => API.get("/products", { params });
export const getFeatured    = ()       => API.get("/products/featured");
export const getProductById = (id)     => API.get(`/products/${id}`);
export const getRelated     = (id)     => API.get(`/products/${id}/related`);

export const createProduct     = (data) => API.post("/products", data);
export const updateProduct     = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct     = (id)   => API.delete(`/products/${id}`);

// BUG FIX: these were missing — FarmerDashboard and AdminDashboard call them
export const deactivateProduct = (id)   => API.patch(`/products/${id}/deactivate`);
export const activateProduct   = (id)   => API.patch(`/products/${id}/activate`);
