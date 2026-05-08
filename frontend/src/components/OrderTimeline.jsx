/**
 * File: src/components/OrderTimeline.jsx
 * Description: Navigation bar component for the 
 * KrishiMart frontend, including desktop and mobile menus.
 */

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

/**
 * Returns dynamic navigation link styles based on the active route.
 */
const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-bold transition ${
    isActive
      ? "bg-leaf-600 text-white"
      : "text-slate-600 hover:bg-leaf-50 hover:text-leaf-700"
  }`;

export default function Navbar() {
  /**
   * Access authenticated user data and logout functionality.
   */
  const { user, logout } = useAuth();

  /**
   * Access the total number of items currently in the cart.
   */
  const { itemCount } = useCart();

  const navigate = useNavigate();

  /**
   * Controls whether the mobile navigation menu is open or closed.
   */
  const [open, setOpen] = useState(false);

  /**
   * Logs out the current user and redirects them to the home page.
   */
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-leaf-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand logo and home link */}
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-600 text-xl text-white shadow-card">
            🌾
          </span>

          <div>
            <p className="text-xl font-black leading-none text-slate-950">
              KrishiMart
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-leaf-600">
              Farm fresh
            </p>
          </div>
        </Link>

        {/* Desktop navigation links */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navClass}>
            Products
          </NavLink>

          {/* Cart and dashboard links are shown only to logged-in users */}
          {user && (
            <NavLink to="/cart" className={navClass}>
              Cart ({itemCount})
            </NavLink>
          )}

          {user && (
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          )}

          {/* Admin link is shown only for admin users */}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Desktop authentication controls */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              {/* Logged-in user details */}
              <div className="text-right">
                <p className="text-sm font-black text-slate-800">{user.name}</p>
                <p className="text-xs capitalize text-slate-400">{user.role}</p>
              </div>

              <button onClick={handleLogout} className="btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Guest authentication links */}
              <Link to="/login" className="btn-outline">
                Login
              </Link>

              <Link to="/register" className="btn-primary">
                Create account
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 md:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile navigation menu */}
      {open && (
        <div className="border-t border-leaf-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <NavLink onClick={() => setOpen(false)} to="/" className={navClass}>
              Home
            </NavLink>

            <NavLink
              onClick={() => setOpen(false)}
              to="/products"
              className={navClass}
            >
              Products
            </NavLink>

            {/* Mobile links for logged-in users */}
            {user && (
              <NavLink
                onClick={() => setOpen(false)}
                to="/cart"
                className={navClass}
              >
                Cart ({itemCount})
              </NavLink>
            )}

            {user && (
              <NavLink
                onClick={() => setOpen(false)}
                to="/dashboard"
                className={navClass}
              >
                Dashboard
              </NavLink>
            )}

            {/* Mobile admin link */}
            {user?.role === "admin" && (
              <NavLink
                onClick={() => setOpen(false)}
                to="/admin"
                className={navClass}
              >
                Admin
              </NavLink>
            )}

            {/* Mobile authentication actions */}
            <div className="mt-3 flex gap-2">
              {user ? (
                <button onClick={handleLogout} className="btn-outline flex-1">
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-outline flex-1 text-center"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="btn-primary flex-1 text-center"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}