// src/services/api.js
import axios from "axios";

const API = axios.create({
  // In dev this uses the Vite proxy in vite.config.js.
  // For production you can set VITE_API_URL=http://your-api-domain/api
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
