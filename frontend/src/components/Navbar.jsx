// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-green-600 p-4 text-white flex justify-between">
      <Link to="/" className="font-bold text-xl">
        KrishiMarket 🌾
      </Link>

      <div className="space-x-4">
        <Link to="/cart">Cart</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}