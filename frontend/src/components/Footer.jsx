/**
 * File: src/components/Footer.jsx
 * Description: Displays the main website footer with 
 * brand details, navigation links, platform information, 
 * and copyright text.
 */

import { Link } from "react-router-dom";

export default function Footer() {
  /**
   * Gets the current year dynamically for the copyright section.
   */
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

        /* Footer root container */
        .kf-root {
          font-family: 'DM Sans', sans-serif;
          background: #0d1f0d;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        /* Decorative radial glow on the top-left side */
        .kf-root::before {
          content: '';
          position: absolute;
          top: -120px;
          left: -80px;
          width: 520px;
          height: 420px;
          background: radial-gradient(ellipse, rgba(76,175,80,0.13) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Decorative radial glow on the bottom-right side */
        .kf-root::after {
          content: '';
          position: absolute;
          bottom: 40px;
          right: -60px;
          width: 340px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(45,125,45,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Thin decorative line above the footer */
        .kf-topbar {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(76,175,80,0.5) 30%, rgba(165,214,167,0.6) 55%, transparent 100%);
        }

        /* Main footer grid layout */
        .kf-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px 28px 48px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          position: relative;
          z-index: 1;
        }

        /* Changes the footer into three columns on larger screens */
        @media (min-width: 640px) {
          .kf-main {
            grid-template-columns: 1.8fr 1fr 1fr;
            gap: 40px;
          }
        }

        /* Brand section wrapper */
        .kf-brand {}

        /* Logo link container */
        .kf-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          margin-bottom: 20px;
        }

        /* Logo icon styling */
        .kf-logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(145deg, #2d7d2d 0%, #4caf50 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 0 0 1px rgba(76,175,80,0.3), 0 4px 18px rgba(45,125,45,0.4);
          flex-shrink: 0;
        }

        /* Brand name text */
        .kf-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 900;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.3px;
        }

        /* Brand tagline below the logo name */
        .kf-logo-tag {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #66bb6a;
          margin-top: 3px;
          display: block;
        }

        /* Footer brand description */
        .kf-desc {
          font-size: 14px;
          line-height: 1.75;
          color: #8aad8a;
          max-width: 340px;
          margin-bottom: 28px;
        }

        /* Feature pill row */
        .kf-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* Individual feature pill */
        .kf-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 100px;
          border: 1px solid rgba(76,175,80,0.2);
          background: rgba(76,175,80,0.06);
          font-size: 12px;
          font-weight: 500;
          color: #81c784;
        }

        /* Small dot inside each feature pill */
        .kf-pill-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #4caf50;
          flex-shrink: 0;
        }

        /* Footer column heading */
        .kf-col-heading {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 700;
          color: #e8f5e9;
          letter-spacing: 0.01em;
          margin-bottom: 18px;
          position: relative;
          display: inline-block;
        }

        /* Small underline below footer column headings */
        .kf-col-heading::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          width: 24px;
          height: 2px;
          background: #4caf50;
          border-radius: 2px;
        }

        /* Footer link list */
        .kf-col-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        /* Footer link styling */
        .kf-col-link {
          font-size: 14px;
          font-weight: 400;
          color: #7a9e7a;
          text-decoration: none;
          transition: color 0.18s ease, padding-left 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* Animated line shown before footer links on hover */
        .kf-col-link::before {
          content: '';
          display: inline-block;
          width: 0;
          height: 1px;
          background: #4caf50;
          transition: width 0.2s ease;
          vertical-align: middle;
        }

        .kf-col-link:hover {
          color: #c8e6c9;
          padding-left: 6px;
        }

        .kf-col-link:hover::before {
          width: 10px;
        }

        /* Divider wrapper */
        .kf-divider {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 28px;
          position: relative;
          z-index: 1;
        }

        /* Horizontal divider line */
        .kf-divider-line {
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        /* Bottom footer section */
        .kf-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 28px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        /* Copyright text */
        .kf-copyright {
          font-size: 13px;
          color: #4a6e4a;
        }

        .kf-copyright strong {
          color: #66bb6a;
          font-weight: 600;
        }

        /* Technology/project badge shown at the bottom-right */
        .kf-stack-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 100px;
          border: 1px solid rgba(76,175,80,0.18);
          background: rgba(76,175,80,0.05);
          font-size: 12px;
          font-weight: 500;
          color: #4a6e4a;
        }

        .kf-stack-badge span {
          color: #66bb6a;
        }
      `}</style>

      <footer className="kf-root">
        {/* Decorative top border */}
        <div className="kf-topbar" />

        <div className="kf-main">
          {/* Brand information section */}
          <div className="kf-brand">
            <Link to="/" className="kf-logo">
              <span className="kf-logo-icon">🌾</span>

              <div>
                <span className="kf-logo-name">KrishiMart</span>
                <span className="kf-logo-tag">Agricultural marketplace</span>
              </div>
            </Link>

            <p className="kf-desc">
              Connecting customers with fresh farm produce through a modern, secure marketplace — built with care for the soil and the soul of Bangladesh's agriculture.
            </p>

            {/* Key platform feature badges */}
            <div className="kf-pills">
              <span className="kf-pill">
                <span className="kf-pill-dot" />
                JWT Auth
              </span>

              <span className="kf-pill">
                <span className="kf-pill-dot" />
                Secure Checkout
              </span>

              <span className="kf-pill">
                <span className="kf-pill-dot" />
                Mobile Ready
              </span>

              <span className="kf-pill">
                <span className="kf-pill-dot" />
                Fast Search
              </span>
            </div>
          </div>

          {/* Main navigation links */}
          <div>
            <p className="kf-col-heading">Explore</p>

            <div className="kf-col-links">
              <Link to="/products" className="kf-col-link">
                All Products
              </Link>

              <Link to="/cart" className="kf-col-link">
                My Cart
              </Link>

              <Link to="/dashboard" className="kf-col-link">
                Order History
              </Link>

              <Link to="/register" className="kf-col-link">
                Create Account
              </Link>

              <Link to="/login" className="kf-col-link">
                Sign In
              </Link>
            </div>
          </div>

          {/* Platform and technology information */}
          <div>
            <p className="kf-col-heading">Platform</p>

            <div className="kf-col-links">
              <span className="kf-col-link" style={{ cursor: "default" }}>
                MERN Stack
              </span>

              <span className="kf-col-link" style={{ cursor: "default" }}>
                React + Vite
              </span>

              <span className="kf-col-link" style={{ cursor: "default" }}>
                TailwindCSS
              </span>

              <span className="kf-col-link" style={{ cursor: "default" }}>
                MongoDB Atlas
              </span>

              <span className="kf-col-link" style={{ cursor: "default" }}>
                Express API
              </span>
            </div>
          </div>
        </div>

        {/* Divider between main footer content and bottom bar */}
        <div className="kf-divider">
          <div className="kf-divider-line" />
        </div>

        {/* Bottom copyright and project badge section */}
        <div className="kf-bottom">
          <p className="kf-copyright">
            © {year} <strong>KrishiMart</strong> — Farm fresh, delivered with purpose.
          </p>

          <span className="kf-stack-badge">
            Built with <span>♥</span> for SRS completion
          </span>
        </div>
      </footer>
    </>
  );
}