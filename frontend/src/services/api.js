import axios from "axios";

/**
 * Central Axios instance for ArgoFarm API.
 *
 * BUG FIX 1: The old interceptor deleted the token on ANY 401.
 * This was too aggressive — a failed cart load or a momentary network
 * error would silently wipe the token, making every component that calls
 * useAuth() see user = null (i.e. "not logged in").
 *
 * We now only clear the token when the 401 comes from /auth/* endpoints
 * (real authentication failures), not from regular API calls.
 *
 * BUG FIX 2: withCredentials: true caused CORS preflight failures when the
 * backend CORS config didn't exactly match the browser origin.
 * Credentials are only needed for cookie-based auth; we use JWT in headers,
 * so withCredentials is not needed and causes more problems than it solves.
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 15000,
  // Removed withCredentials: true — we use Authorization header, not cookies
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Only clear token on real auth failures, not every 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url    = error?.config?.url || "";

    // Only log out if the /auth/me or /auth/login endpoint returns 401.
    // This means the token is genuinely invalid/expired — not just a
    // permission error on a different resource.
    if (status === 401 && (url.includes("/auth/me") || url.includes("/auth/login"))) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);
