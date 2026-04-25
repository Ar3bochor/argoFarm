// src/pages/dashboards/UserDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import * as orderService from "../../services/orderService";

const STATUS_STYLES = {
  delivered:  { bg: "bg-green-100",  text: "text-green-700",  label: "Delivered"   },
  processing: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Processing"  },
  shipped:    { bg: "bg-blue-100",   text: "text-blue-700",   label: "Shipped"     },
  cancelled:  { bg: "bg-red-100",    text: "text-red-600",    label: "Cancelled"   },
  pending:    { bg: "bg-gray-100",   text: "text-gray-600",   label: "Pending"     },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        setOrders(res?.data || []);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const delivered = orders.filter((o) => o.status === "delivered").length;
  const pending   = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status)).length;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders",   label: `Orders (${orders.length})` },
    { id: "profile",  label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top header bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-green-600 font-black text-xl">KrishiMart 🌾</Link>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="text-gray-500 hover:text-gray-800 transition text-sm font-medium">
              🛒 Cart
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome banner */}
        <div
          className="rounded-3xl p-8 mb-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #14532d 0%, #16a34a 70%, #4ade80 100%)" }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="absolute bottom-0 right-20 w-32 h-32 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="relative z-10">
            <p className="text-green-200 text-sm font-medium mb-1">Welcome back 👋</p>
            <h1 className="text-white text-3xl font-black mb-1">
              {user?.name || "Farmer Friend"}
            </h1>
            <p className="text-green-200 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📦" label="Total Orders"  value={orders.length}              sub="All time"           color="bg-green-50" />
          <StatCard icon="✅" label="Delivered"     value={delivered}                  sub="Successfully"       color="bg-emerald-50" />
          <StatCard icon="🚚" label="In Progress"   value={pending}                    sub="Active orders"      color="bg-yellow-50" />
          <StatCard icon="💰" label="Total Spent"   value={`৳${totalSpent.toFixed(0)}`} sub="Excluding cancelled" color="bg-blue-50" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
              {loadingOrders ? (
                <p className="text-gray-400 text-sm">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-4xl mb-3">🛒</p>
                  <p className="text-gray-500 font-medium">No orders yet</p>
                  <Link
                    to="/"
                    className="inline-block mt-4 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          Order #{order._id?.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-BD", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={order.status} />
                        <p className="font-bold text-gray-900 text-sm">৳{order.totalPrice}</p>
                      </div>
                    </div>
                  ))}
                  {orders.length > 3 && (
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="w-full py-2.5 text-sm text-green-600 font-semibold hover:bg-green-50 rounded-xl transition"
                    >
                      View all {orders.length} orders →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: "🌿", label: "Shop Now",     to: "/"         },
                  { icon: "🛒", label: "View Cart",    to: "/cart"     },
                  { icon: "📦", label: "My Orders",    action: () => setActiveTab("orders") },
                  { icon: "👤", label: "Edit Profile", action: () => setActiveTab("profile") },
                ].map((item) =>
                  item.to ? (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition group"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs font-semibold text-gray-600 group-hover:text-green-700">{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition group"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-xs font-semibold text-gray-600 group-hover:text-green-700">{item.label}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">All Orders</h2>
            {loadingOrders ? (
              <p className="text-gray-400 text-sm">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">📭</p>
                <p className="text-gray-500 font-medium text-lg">No orders yet</p>
                <p className="text-gray-400 text-sm mt-1">Your order history will appear here</p>
                <Link
                  to="/"
                  className="inline-block mt-5 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 text-xs font-semibold uppercase border-b border-gray-100">
                      <th className="pb-3 pr-4">Order ID</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Items</th>
                      <th className="pb-3 pr-4">Total</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition">
                        <td className="py-3.5 pr-4 font-mono font-semibold text-gray-700">
                          #{order._id?.slice(-6).toUpperCase()}
                        </td>
                        <td className="py-3.5 pr-4 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("en-BD", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 pr-4 text-gray-500">
                          {order.orderItems?.length || 0} item(s)
                        </td>
                        <td className="py-3.5 pr-4 font-bold text-gray-900">
                          ৳{order.totalPrice}
                        </td>
                        <td className="py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Information</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-2xl font-black text-green-700">
                {user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full capitalize">
                  {user?.role || "user"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900 placeholder-gray-400"
                />
              </div>
              <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg shadow-green-100 hover:-translate-y-0.5 active:translate-y-0 duration-200">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}