import API from "./api";

export const getProfile = () => API.get("/users/profile");
export const updateProfile = (data) => API.put("/users/profile", data);

export const getAddresses = () => API.get("/users/addresses");
export const addAddress = (data) => API.post("/users/addresses", data);
export const updateAddress = (id, data) => API.put(`/users/addresses/${id}`, data);
export const deleteAddress = (id) => API.delete(`/users/addresses/${id}`);

export const deleteAccount = () => API.delete("/users/account");