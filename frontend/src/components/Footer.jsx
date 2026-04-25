import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-leaf-100 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-600 text-xl">🌾</span>
            <div>
              <p className="text-xl font-black">KrishiMart</p>
              <p className="text-xs text-leaf-200">Agricultural marketplace</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            A modern MERN stack marketplace connecting customers with fresh agricultural products, secure checkout, and reliable order tracking.
          </p>
        </div>
        <div>
          <p className="font-black">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-300">
            <Link to="/products">Products</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/dashboard">Orders</Link>
          </div>
        </div>
        <div>
          <p className="font-black">Support</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>Fast search and filters</p>
            <p>Secure JWT checkout</p>
            <p>Responsive mobile screens</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">© {new Date().getFullYear()} KrishiMart. Built for SRS completion.</div>
    </footer>
  );
}
