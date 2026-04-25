// src/hooks/useAuth.js ✅ minimum safe version
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function useAuth() {
  return useContext(AuthContext); // must NOT return undefined
}