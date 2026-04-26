import API from "./api";

export const getProducts = (params = {}) => API.get("/products", { params });
export const getFeaturedProducts = () => API.get("/products/featured");
export const getProductById = (id) => API.get(`/products/${id}`);

export const createProduct = (data) => API.post("/products", data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
