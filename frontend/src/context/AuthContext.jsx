// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import * as authService from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (formData) => {
    const { data } = await authService.loginUser(formData);
    localStorage.setItem("token", data.token);
    await loadUser();
  };

  const register = async (formData) => {
    const { data } = await authService.registerUser(formData);
    localStorage.setItem("token", data.token);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};