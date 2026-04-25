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

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const { data } = await authService.getMe();
      setUser(data);
      return data;
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

  const login = async (formData) => {
    const { data } = await authService.loginUser(formData);
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authService.registerUser(formData);
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout, refreshUser: loadUser, isAdmin: user?.role === "admin" }),
    [user, loading, loadUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
