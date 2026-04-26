import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-bold transition ${isActive ? "bg-leaf-600 text-white" : "text-slate-600 hover:bg-leaf-50 hover:text-leaf-700"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-leaf-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-600 text-xl text-white shadow-card">🌾</span>
          <div>
            <p className="text-xl font-black leading-none text-slate-950">KrishiMart</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-leaf-600">Farm fresh</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/products" className={navClass}>Products</NavLink>
          {user && <NavLink to="/cart" className={navClass}>Cart ({itemCount})</NavLink>}
          {user && <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin" className={navClass}>Admin</NavLink>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-sm font-black text-slate-800">{user.name}</p>
                <p className="text-xs capitalize text-slate-400">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="btn-outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/register" className="btn-primary">Create account</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 md:hidden" aria-label="Toggle menu">
          ☰
        </button>
      </div>

      {open && (
        <div className="border-t border-leaf-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <NavLink onClick={() => setOpen(false)} to="/" className={navClass}>Home</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/products" className={navClass}>Products</NavLink>
            {user && <NavLink onClick={() => setOpen(false)} to="/cart" className={navClass}>Cart ({itemCount})</NavLink>}
            {user && <NavLink onClick={() => setOpen(false)} to="/dashboard" className={navClass}>Dashboard</NavLink>}
            {user?.role === "admin" && <NavLink onClick={() => setOpen(false)} to="/admin" className={navClass}>Admin</NavLink>}
            <div className="mt-3 flex gap-2">
              {user ? <button onClick={handleLogout} className="btn-outline flex-1">Logout</button> : <><Link to="/login" className="btn-outline flex-1 text-center">Login</Link><Link to="/register" className="btn-primary flex-1 text-center">Join</Link></>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
