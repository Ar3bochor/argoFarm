import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  /**
   * Backend shape: { success: true, data: { _id, name, email, role, ... } }
   * Axios wraps that in response.data, so:
   *   authService.getMe() returns axios response
   *   response.data = { success, data: user }
   *   response.data.data = the actual user object
   */
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return null;
    }
    try {
      const { data } = await authService.getMe();
      // data = { success: true, data: userObject }
      const userData = data?.data ?? data;
      if (!userData?._id) {
        logout();
        return null;
      }
      setUser(userData);
      return userData;
    } catch {
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Login: backend returns { success, data: { _id, name, email, role, token } }
   * Axios response.data = { success, data: userWithToken }
   */
  const login = async (formData) => {
    const { data } = await authService.loginUser(formData);
    // data = { success: true, data: { _id, name, email, role, phone, token } }
    const userData = data?.data ?? data;
    if (!userData?.token) throw new Error("Login failed — no token returned");
    localStorage.setItem("token", userData.token);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const { data } = await authService.registerUser(formData);
    const userData = data?.data ?? data;
    if (!userData?.token) throw new Error("Registration failed — no token returned");
    localStorage.setItem("token", userData.token);
    setUser(userData);
    return userData;
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      refreshUser: loadUser,
      isAdmin:  user?.role === "admin",
      isFarmer: user?.role === "farmer",
      isUser:   user?.role === "user",
    }),
    [user, loading, loadUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};