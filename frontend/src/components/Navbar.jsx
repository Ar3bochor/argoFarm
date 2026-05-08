/**
 * File: src/components/Navbar.jsx
 * Description: Main responsive navigation bar for the application, including role-based dashboard links,
 * cart count display, authentication actions, and mobile drawer navigation.
 */

import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

/**
 * Returns the correct dashboard route based on the logged-in user's role.
 * This ensures admin, farmer, and regular user accounts are sent to the right dashboard.
 */
const getDashboardPath = (role) => {
  if (role === "admin") return "/admin";
  if (role === "farmer") return "/dashboard/farmer";
  return "/dashboard/user";
};

/**
 * Returns a user-friendly dashboard label based on the logged-in user's role.
 */
const getDashboardLabel = (role) => {
  if (role === "admin") return "Admin";
  if (role === "farmer") return "My Farm";
  return "Dashboard";
};

export default function Navbar() {
  /**
   * Access authenticated user information and logout functionality.
   */
  const { user, logout } = useAuth();

  /**
   * Access the number of items currently available in the user's cart.
   */
  const { itemCount } = useCart();

  const navigate = useNavigate();

  /**
   * Controls whether the mobile drawer menu is open or closed.
   */
  const [open, setOpen] = useState(false);

  /**
   * Tracks whether the page has been scrolled to apply a subtle navbar shadow.
   */
  const [scrolled, setScrolled] = useState(false);

  /**
   * Adds a scroll listener to detect when the navbar should use the scrolled style.
   */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Logs out the current user, redirects to the homepage, and closes the mobile drawer.
   */
  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  /**
   * Closes the mobile drawer after a mobile navigation link is selected.
   */
  const close = () => setOpen(false);

  /**
   * Resolve dashboard route and label according to the current user's role.
   */
  const dashPath = getDashboardPath(user?.role);
  const dashLabel = getDashboardLabel(user?.role);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

        /* Sticky navbar wrapper */
        .km-nav-root {
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }

        /* Shadow applied after scrolling */
        .km-nav-root.scrolled {
          box-shadow: 0 2px 24px 0 rgba(34,85,34,0.10);
        }

        /* Main navbar background */
        .km-nav-bar {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1.5px solid #e8f0e2;
        }

        /* Navbar content container */
        .km-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* Brand logo area */
        .km-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .km-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, #2d7d2d 0%, #4caf50 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(45,125,45,0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .km-logo:hover .km-logo-icon {
          transform: scale(1.06) rotate(-4deg);
          box-shadow: 0 4px 16px rgba(45,125,45,0.35);
        }

        .km-logo-text {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .km-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1a3d1a;
          line-height: 1;
          letter-spacing: -0.3px;
        }

        .km-logo-sub {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #4caf50;
          line-height: 1;
          margin-top: 2px;
        }

        /* Desktop navigation links */
        .km-links {
          display: none;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .km-links {
            display: flex;
          }
        }

        .km-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          color: #4a5568;
          text-decoration: none;
          transition: background 0.18s ease, color 0.18s ease;
          position: relative;
          white-space: nowrap;
        }

        .km-link:hover {
          background: #f0f7ef;
          color: #2d7d2d;
        }

        .km-link.active {
          background: #2d7d2d;
          color: #fff;
          font-weight: 600;
        }

        /* Cart item count badge */
        .km-cart-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ff6b35;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 100px;
          padding: 0 5px;
          line-height: 1;
        }

        .km-link.active .km-cart-badge {
          background: rgba(255,255,255,0.25);
          color: #fff;
        }

        /* Desktop authentication area */
        .km-auth {
          display: none;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .km-auth {
            display: flex;
          }
        }

        .km-user-info {
          text-align: right;
        }

        .km-user-name {
          font-size: 13px;
          font-weight: 600;
          color: #1a3d1a;
          line-height: 1.2;
        }

        .km-user-role {
          font-size: 11px;
          color: #4caf50;
          text-transform: capitalize;
          font-weight: 500;
        }

        /* Circular user avatar */
        .km-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          color: #1a3d1a;
          border: 2px solid #a5d6a7;
          flex-shrink: 0;
        }

        /* Secondary button style */
        .km-btn-ghost {
          padding: 8px 18px;
          border-radius: 100px;
          border: 1.5px solid #c8e6c9;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: #2d7d2d;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex;
          align-items: center;
        }

        .km-btn-ghost:hover {
          background: #f0f7ef;
          border-color: #81c784;
        }

        /* Primary button style */
        .km-btn-solid {
          padding: 8px 20px;
          border-radius: 100px;
          border: 1.5px solid transparent;
          background: #2d7d2d;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(45,125,45,0.25);
        }

        .km-btn-solid:hover {
          background: #225c22;
          box-shadow: 0 4px 14px rgba(45,125,45,0.35);
          transform: translateY(-1px);
        }

        .km-btn-solid:active {
          transform: translateY(0);
        }

        /* Mobile hamburger button */
        .km-hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1.5px solid #e2ede2;
          background: transparent;
          cursor: pointer;
          gap: 5px;
          padding: 0;
          transition: background 0.18s ease, border-color 0.18s ease;
        }

        .km-hamburger:hover {
          background: #f0f7ef;
          border-color: #a5d6a7;
        }

        @media (min-width: 768px) {
          .km-hamburger {
            display: none;
          }
        }

        .km-ham-bar {
          display: block;
          width: 18px;
          height: 2px;
          background: #2d7d2d;
          border-radius: 2px;
          transition: transform 0.25s ease, opacity 0.25s ease;
          transform-origin: center;
        }

        /* Hamburger animation when the drawer is open */
        .km-hamburger.open .km-ham-bar:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        .km-hamburger.open .km-ham-bar:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        .km-hamburger.open .km-ham-bar:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile drawer container */
        .km-drawer {
          background: #fff;
          border-top: 1.5px solid #e8f0e2;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
          opacity: 0;
        }

        .km-drawer.open {
          max-height: 520px;
          opacity: 1;
        }

        .km-drawer-inner {
          padding: 16px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .km-mobile-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: #4a5568;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .km-mobile-link:hover {
          background: #f0f7ef;
          color: #2d7d2d;
        }

        .km-mobile-link.active {
          background: #f0f7ef;
          color: #2d7d2d;
          font-weight: 600;
        }

        .km-drawer-divider {
          height: 1px;
          background: #e8f0e2;
          margin: 8px 0;
        }

        .km-mobile-auth {
          display: flex;
          gap: 10px;
          margin-top: 4px;
        }

        .km-mobile-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0 4px;
        }

        /* Decorative gradient strip above the navbar */
        .km-stripe {
          height: 3px;
          background: linear-gradient(90deg, #2d7d2d 0%, #66bb6a 40%, #a5d6a7 70%, #e8f5e9 100%);
        }
      `}</style>

      <header className={`km-nav-root${scrolled ? " scrolled" : ""}`}>
        {/* Decorative top gradient strip */}
        <div className="km-stripe" />

        <div className="km-nav-bar">
          <div className="km-inner">
            {/* Application logo and homepage link */}
            <Link to="/" className="km-logo">
              <span className="km-logo-icon">🌾</span>

              <div className="km-logo-text">
                <span className="km-logo-name">ArgoFarm</span>
                <span className="km-logo-sub">Farm Fresh</span>
              </div>
            </Link>

            {/* Desktop navigation menu */}
            <nav className="km-links">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `km-link${isActive ? " active" : ""}`}
              >
                Home
              </NavLink>

              <NavLink
                to="/products"
                className={({ isActive }) => `km-link${isActive ? " active" : ""}`}
              >
                Products
              </NavLink>

              {/* Cart link is visible only for logged-in users */}
              {user && (
                <NavLink
                  to="/cart"
                  className={({ isActive }) => `km-link${isActive ? " active" : ""}`}
                >
                  Cart
                  {itemCount > 0 && (
                    <span className="km-cart-badge">{itemCount}</span>
                  )}
                </NavLink>
              )}

              {/* Role-based dashboard link */}
              {user && (
                <NavLink
                  to={dashPath}
                  className={({ isActive }) => `km-link${isActive ? " active" : ""}`}
                >
                  {dashLabel}
                </NavLink>
              )}
            </nav>

            {/* Desktop authentication controls */}
            <div className="km-auth">
              {user ? (
                <>
                  {/* Logged-in user details */}
                  <div className="km-user-info">
                    <div className="km-user-name">{user.name}</div>
                    <div className="km-user-role">{user.role}</div>
                  </div>

                  {/* User avatar generated from the first letter of the user's name */}
                  <div className="km-avatar">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>

                  <button onClick={handleLogout} className="km-btn-ghost">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Guest authentication links */}
                  <Link to="/login" className="km-btn-ghost">
                    Login
                  </Link>

                  <Link to="/register" className="km-btn-solid">
                    Get started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setOpen((v) => !v)}
              className={`km-hamburger${open ? " open" : ""}`}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <span className="km-ham-bar" />
              <span className="km-ham-bar" />
              <span className="km-ham-bar" />
            </button>
          </div>
        </div>

        {/* Mobile drawer navigation */}
        <div className={`km-drawer${open ? " open" : ""}`} aria-hidden={!open}>
          <div className="km-drawer-inner">
            <NavLink
              onClick={close}
              to="/"
              end
              className={({ isActive }) => `km-mobile-link${isActive ? " active" : ""}`}
            >
              🏠 Home
            </NavLink>

            <NavLink
              onClick={close}
              to="/products"
              className={({ isActive }) => `km-mobile-link${isActive ? " active" : ""}`}
            >
              🛒 Products
            </NavLink>

            {/* Mobile cart link for logged-in users */}
            {user && (
              <NavLink
                onClick={close}
                to="/cart"
                className={({ isActive }) => `km-mobile-link${isActive ? " active" : ""}`}
              >
                🧺 Cart
                {itemCount > 0 && (
                  <span className="km-cart-badge" style={{ marginLeft: 4 }}>
                    {itemCount}
                  </span>
                )}
              </NavLink>
            )}

            {/* Mobile role-based dashboard link */}
            {user && (
              <NavLink
                onClick={close}
                to={dashPath}
                className={({ isActive }) => `km-mobile-link${isActive ? " active" : ""}`}
              >
                {user.role === "admin" ? "⚙️" : user.role === "farmer" ? "🌱" : "📊"} {dashLabel}
              </NavLink>
            )}

            <div className="km-drawer-divider" />

            {user ? (
              /* Mobile logged-in user section */
              <div className="km-mobile-user">
                <div className="km-avatar">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>

                <div>
                  <div className="km-user-name">{user.name}</div>
                  <div className="km-user-role">{user.role}</div>
                </div>

                <button
                  onClick={handleLogout}
                  className="km-btn-ghost"
                  style={{ marginLeft: "auto" }}
                >
                  Logout
                </button>
              </div>
            ) : (
              /* Mobile guest authentication buttons */
              <div className="km-mobile-auth">
                <Link
                  to="/login"
                  onClick={close}
                  className="km-btn-ghost"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={close}
                  className="km-btn-solid"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}