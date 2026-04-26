import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AddressForm from "../../components/AddressForm";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import * as orderService from "../../services/orderService";
import * as userService from "../../services/userService";
import * as reviewService from "../../services/reviewService";
import { currency, formatDate, getErrorMessage, shortId } from "../../utils/helpers";

const tabs = ["overview", "orders", "addresses", "reviews", "profile"];

export default function UserDashboard() {
  const { user, refreshUser, setUser } = useAuth();
  const { refreshCart } = useCart();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  const [review, setReview] = useState({ productId: "", rating: 5, title: "", comment: "" });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [ordersRes, addressRes] = await Promise.all([orderService.getMyOrders(), userService.getAddresses()]);
      setOrders(ordersRes.data || []);
      setAddresses(addressRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const active = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;
    const spent = orders.filter((o) => o.status !== "cancelled").reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
    return { delivered, active, spent };
  }, [orders]);

  const reviewProducts = useMemo(() => {
    const map = new Map();
    orders.filter((o) => o.status === "delivered").forEach((order) => {
      order.orderItems?.forEach((item) => {
        const id = item.product?._id || item.product;
        if (id) map.set(id, item.name || item.product?.name);
      });
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const handleReorder = async (id) => {
    setMessage("");
    try {
      await orderService.reorder(id);
      await refreshCart();
      setMessage("Previous order items added to cart.");
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not reorder"));
    }
  };

  const addAddress = async (payload) => {
    await userService.addAddress(payload);
    await loadDashboard();
    await refreshUser();
  };

  const removeAddress = async (id) => {
    await userService.deleteAddress(id);
    await loadDashboard();
    await refreshUser();
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const { data } = await userService.updateProfile(profile);
      setUser(data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not update profile"));
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await reviewService.createReview(review);
      setReview({ productId: "", rating: 5, title: "", comment: "" });
      setMessage("Review submitted for admin moderation.");
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not submit review"));
    }
  };

  return (
    <main className="page-shell">
      <section className="mb-8 rounded-[2rem] bg-gradient-to-br from-leaf-900 via-leaf-700 to-leaf-500 p-8 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-leaf-100">Customer dashboard</p>
        <h1 className="mt-3 text-4xl font-black">Welcome, {user?.name}</h1>
        <p className="mt-2 text-leaf-100">Track orders, reorder previous purchases, manage addresses, and submit product reviews.</p>
      </section>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value={orders.length} icon="📦" />
        <Stat label="Delivered" value={stats.delivered} icon="✅" />
        <Stat label="Active" value={stats.active} icon="🚚" />
        <Stat label="Total spent" value={currency(stats.spent)} icon="💰" />
      </div>

      <div className="mb-6 flex gap-2 overflow-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-black capitalize transition ${activeTab === tab ? "bg-leaf-600 text-white" : "text-slate-500 hover:bg-leaf-50 hover:text-leaf-700"}`}>{tab}</button>
        ))}
      </div>

      {message && <p className="mb-6 rounded-2xl bg-leaf-50 p-4 text-sm font-bold text-leaf-700 ring-1 ring-leaf-100">{message}</p>}

      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="panel">
            <h2 className="panel-title">Recent orders</h2>
            <OrderList orders={orders.slice(0, 4)} loading={loading} onReorder={handleReorder} compact />
          </div>
          <div className="panel">
            <h2 className="panel-title">Quick actions</h2>
            <div className="mt-5 grid gap-3">
              <Link to="/products" className="quick-action">🌿 Browse products</Link>
              <Link to="/cart" className="quick-action">🛒 Open cart</Link>
              <button onClick={() => setActiveTab("addresses")} className="quick-action text-left">📍 Manage addresses</button>
              <button onClick={() => setActiveTab("reviews")} className="quick-action text-left">⭐ Write review</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && <div className="panel"><h2 className="panel-title">Order history</h2><OrderList orders={orders} loading={loading} onReorder={handleReorder} /></div>}

      {activeTab === "addresses" && (
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <div className="panel"><h2 className="panel-title">Add delivery address</h2><div className="mt-5"><AddressForm onSubmit={addAddress} submitLabel="Save address" /></div></div>
          <div className="panel">
            <h2 className="panel-title">Saved addresses</h2>
            <div className="mt-5 grid gap-3">
              {addresses.length ? addresses.map((address) => (
                <div key={address._id} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between"><p className="font-black text-slate-950">{address.label}</p>{address.isDefault && <span className="rounded-full bg-leaf-100 px-2 py-1 text-xs font-bold text-leaf-700">Default</span>}</div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{address.fullName}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{address.address}, {address.city}</p>
                  <button onClick={() => removeAddress(address._id)} className="mt-3 text-sm font-bold text-rose-500">Delete</button>
                </div>
              )) : <EmptyState icon="📍" title="No addresses yet" message="Add your first delivery address." />}
            </div>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="panel max-w-2xl">
          <h2 className="panel-title">Review purchased product</h2>
          {reviewProducts.length ? (
            <form onSubmit={submitReview} className="mt-5 space-y-4">
              <label className="field-label">Product<select required value={review.productId} onChange={(e) => setReview((p) => ({ ...p, productId: e.target.value }))} className="field"><option value="">Select delivered product</option>{reviewProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
              <label className="field-label">Rating<select value={review.rating} onChange={(e) => setReview((p) => ({ ...p, rating: Number(e.target.value) }))} className="field">{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label>
              <label className="field-label">Title<input value={review.title} onChange={(e) => setReview((p) => ({ ...p, title: e.target.value }))} className="field" placeholder="Fresh and good quality" /></label>
              <label className="field-label">Comment<textarea required value={review.comment} onChange={(e) => setReview((p) => ({ ...p, comment: e.target.value }))} className="field min-h-28" placeholder="Write your review" /></label>
              <button className="btn-primary w-full">Submit review</button>
            </form>
          ) : <EmptyState icon="⭐" title="No delivered products to review" message="After an order is delivered, purchased products will appear here." />}
        </div>
      )}

      {activeTab === "profile" && (
        <div className="panel max-w-xl">
          <h2 className="panel-title">Profile details</h2>
          <form onSubmit={updateProfile} className="mt-5 space-y-4">
            <label className="field-label">Name<input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="field" /></label>
            <label className="field-label">Email<input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} className="field" /></label>
            <label className="field-label">Phone<input value={profile.phone || ""} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="field" /></label>
            <button className="btn-primary w-full">Update profile</button>
          </form>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value, icon }) {
  return <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100"><div className="text-3xl">{icon}</div><p className="mt-4 text-2xl font-black text-slate-950">{value}</p><p className="text-sm font-bold text-slate-400">{label}</p></div>;
}

function OrderList({ orders, loading, onReorder, compact = false }) {
  if (loading) return <p className="mt-5 text-sm text-slate-400">Loading orders...</p>;
  if (!orders.length) return <div className="mt-5"><EmptyState icon="📭" title="No orders yet" message="Your order history will appear here." actionLabel="Start shopping" actionTo="/products" /></div>;
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="py-3 pr-4">Order</th><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Total</th><th className="py-3 pr-4">Status</th><th className="py-3">Action</th></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b border-slate-50">
              <td className="py-4 pr-4 font-black text-slate-950"><Link to={`/orders/${order._id}`}>{shortId(order._id)}</Link></td>
              <td className="py-4 pr-4 text-slate-500">{formatDate(order.createdAt)}</td>
              <td className="py-4 pr-4 font-bold text-leaf-700">{currency(order.totalPrice)}</td>
              <td className="py-4 pr-4"><StatusBadge status={order.status} /></td>
              <td className="py-4"><div className="flex gap-2"><Link to={`/orders/${order._id}`} className="btn-mini">Track</Link>{!compact && <button onClick={() => onReorder(order._id)} className="btn-mini">Reorder</button>}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
