import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderDetails from "../pages/OrderDetails";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import UserDashboard from "../pages/dashboards/UserDashboard";
import FarmerDashboard from "../pages/dashboards/FarmerDashboard";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import DashboardRedirect from "./DashboardRedirect";
import EmptyState from "../components/EmptyState";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────────────── */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Authenticated ────────────────────────────────────────── */}
      <Route path="/cart"       element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout"   element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

      {/*
        BUG FIX: /dashboard used to render UserDashboard for everyone.
        Now it redirects based on role:
          admin   → /admin
          farmer  → /dashboard/farmer
          user    → /dashboard/user
      */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardRedirect />
        </ProtectedRoute>
      } />

      <Route path="/dashboard/user" element={
        <RoleRoute roles={["user"]}>
          <UserDashboard />
        </RoleRoute>
      } />

      <Route path="/dashboard/farmer" element={
        <RoleRoute roles={["farmer"]}>
          <FarmerDashboard />
        </RoleRoute>
      } />

      <Route path="/admin" element={
        <RoleRoute roles={["admin"]}>
          <AdminDashboard />
        </RoleRoute>
      } />

      {/* ── 404 ─────────────────────────────────────────────────── */}
      <Route path="*" element={
        <main className="page-shell">
          <EmptyState
            icon="🧭"
            title="Page not found"
            message="The page you requested does not exist."
            actionLabel="Go home"
            actionTo="/"
          />
        </main>
      } />
    </Routes>
  );
}
