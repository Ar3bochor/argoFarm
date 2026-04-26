import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import * as adminService from "../../services/adminService";
import * as productService from "../../services/productService";
import * as categoryService from "../../services/categoryService";
import * as couponService from "../../services/couponService";
import { currency, formatDate, getErrorMessage, shortId } from "../../utils/helpers";

const tabs = ["overview", "products", "categories", "orders", "reviews", "reports", "coupons"];
const emptyProduct = { name: "", description: "", price: "", discountPrice: "", category: "", stock: "", unit: "kg", image: "", tags: "", isFeatured: false, isActive: true };
const emptyCategory = { name: "", description: "", image: "" };
const emptyCoupon = { code: "", description: "", type: "percent", value: "", minOrderAmount: "", maxDiscount: "", usageLimit: "", expiresAt: "", isActive: true };

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [report, setReport] = useState({ report: [], topProducts: [] });
  const [coupons, setCoupons] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadAdmin = async () => {
    setLoading(true);
    try {
      const [statsRes, productRes, categoryRes, orderRes, reviewRes, reportRes, couponRes] = await Promise.all([
        adminService.getDashboardStats(),
        productService.getProducts({ limit: 100 }),
        categoryService.getCategories({ includeInactive: true }),
        adminService.getAllOrders(),
        adminService.getAllReviews(),
        adminService.getSalesReport(),
        couponService.getCoupons().catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data?.data || statsRes.data || {});
      setProducts(productRes.data?.products || productRes.data || []);
      setCategories(categoryRes.data?.data || categoryRes.data || []);
      setOrders(orderRes.data?.orders || orderRes.data || []);
      setReviews(reviewRes.data?.reviews || reviewRes.data || []);
      const rData = reportRes.data?.data || reportRes.data || {}; setReport({ report: rData.dailyReport || rData.report || [], topProducts: rData.topProducts || [] });
      setCoupons(couponRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmin(); }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  };

  const productPayload = (form) => ({
    ...form,
    price: Number(form.price),
    discountPrice: form.discountPrice === "" ? undefined : Number(form.discountPrice),
    stock: Number(form.stock),
    tags: typeof form.tags === "string" ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : form.tags
  });

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) await productService.updateProduct(editingProduct, productPayload(productForm));
      else await productService.createProduct(productPayload(productForm));
      setProductForm(emptyProduct);
      setEditingProduct(null);
      await loadAdmin();
      showMessage("Product saved successfully.");
    } catch (err) {
      showMessage(getErrorMessage(err, "Could not save product"));
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product._id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      discountPrice: product.discountPrice || "",
      category: product.category?._id || product.category || "",
      stock: product.stock || "",
      unit: product.unit || "kg",
      image: product.image || "",
      tags: product.tags?.join(", ") || "",
      isFeatured: !!product.isFeatured,
      isActive: product.isActive !== false
    });
    setActiveTab("products");
  };

  const removeProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await productService.deleteProduct(id);
    await loadAdmin();
    showMessage("Product deleted.");
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryService.createCategory(categoryForm);
      setCategoryForm(emptyCategory);
      await loadAdmin();
      showMessage("Category added.");
    } catch (err) {
      showMessage(getErrorMessage(err, "Could not save category"));
    }
  };

  const removeCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    await categoryService.deleteCategory(id);
    await loadAdmin();
  };

  const changeOrderStatus = async (id, status) => {
    await adminService.updateOrderStatus(id, { status, note: `Marked ${status} from admin dashboard` });
    await loadAdmin();
    showMessage("Order status updated.");
  };

  const moderateReview = async (id, action) => {
    if (action === "approve") await adminService.approveReview(id);
    if (action === "reject") await adminService.rejectReview(id);
    if (action === "delete") await adminService.deleteReview(id);
    await loadAdmin();
    showMessage("Review moderation updated.");
  };

  const saveCoupon = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(Object.entries(couponForm).map(([key, value]) => [key, value === "" ? undefined : value]));
    payload.value = Number(payload.value);
    if (payload.minOrderAmount) payload.minOrderAmount = Number(payload.minOrderAmount);
    if (payload.maxDiscount) payload.maxDiscount = Number(payload.maxDiscount);
    if (payload.usageLimit) payload.usageLimit = Number(payload.usageLimit);
    await couponService.createCoupon(payload);
    setCouponForm(emptyCoupon);
    await loadAdmin();
    showMessage("Coupon created.");
  };

  const totalReportRevenue = useMemo(() => (report.report || []).reduce((sum, row) => sum + Number(row.revenue || 0), 0), [report]);

  return (
    <main className="page-shell">
      <section className="mb-8 rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-leaf-200">Admin dashboard</p>
        <h1 className="mt-3 text-4xl font-black">Operations center</h1>
        <p className="mt-2 max-w-3xl text-slate-300">Manage products, categories, orders, revenue reports, coupons, and customer review moderation with reliable data views.</p>
      </section>

      <div className="mb-6 flex gap-2 overflow-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        {tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-black capitalize transition ${activeTab === tab ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{tab}</button>)}
      </div>

      {message && <p className="mb-6 rounded-2xl bg-leaf-50 p-4 text-sm font-bold text-leaf-700 ring-1 ring-leaf-100">{message}</p>}
      {loading && <p className="mb-6 text-sm font-bold text-slate-400">Loading admin data...</p>}

      {activeTab === "overview" && (
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <AdminStat label="Users" value={stats.users?.total ?? stats.users ?? 0} />
            <AdminStat label="Products" value={stats.products?.total ?? stats.products ?? 0} />
            <AdminStat label="Categories" value={stats.categories || 0} />
            <AdminStat label="Orders" value={stats.orders?.total ?? stats.orders ?? 0} />
            <AdminStat label="Revenue" value={currency(stats.revenue?.total ?? stats.revenue ?? 0)} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentOrders orders={orders.slice(0, 5)} onStatus={changeOrderStatus} />
            <ReviewModeration reviews={reviews.slice(0, 5)} onModerate={moderateReview} />
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <div className="panel h-fit"><h2 className="panel-title">{editingProduct ? "Update product" : "Add new product"}</h2><ProductForm form={productForm} setForm={setProductForm} categories={categories} onSubmit={saveProduct} editing={editingProduct} onCancel={() => { setEditingProduct(null); setProductForm(emptyProduct); }} /></div>
          <div className="panel"><h2 className="panel-title">Product inventory</h2><div className="mt-5 overflow-x-auto"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Action</th></tr></thead><tbody>{products.map((product) => <tr key={product._id}><td className="font-black text-slate-950">{product.name}</td><td>{product.category?.name || "-"}</td><td>{currency(product.discountPrice || product.price)}</td><td>{product.stock}</td><td>{product.averageRating?.toFixed?.(1) || 0}</td><td><button onClick={() => editProduct(product)} className="btn-mini">Edit</button><button onClick={() => removeProduct(product._id)} className="btn-mini ml-2 text-rose-600">Delete</button></td></tr>)}</tbody></table></div></div>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="panel h-fit"><h2 className="panel-title">Create category</h2><form onSubmit={saveCategory} className="mt-5 space-y-4"><label className="field-label">Name<input required value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} className="field" /></label><label className="field-label">Description<textarea value={categoryForm.description} onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} className="field min-h-24" /></label><label className="field-label">Image URL<input value={categoryForm.image} onChange={(e) => setCategoryForm((p) => ({ ...p, image: e.target.value }))} className="field" /></label><button className="btn-primary w-full">Save category</button></form></div>
          <div className="panel"><h2 className="panel-title">Categories</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{categories.map((category) => <div key={category._id} className="rounded-3xl bg-slate-50 p-5"><p className="font-black text-slate-950">{category.name}</p><p className="mt-1 text-sm text-slate-500">{category.description}</p><button onClick={() => removeCategory(category._id)} className="mt-3 text-sm font-bold text-rose-500">Delete</button></div>)}</div></div>
        </div>
      )}

      {activeTab === "orders" && <RecentOrders orders={orders} onStatus={changeOrderStatus} full />}
      {activeTab === "reviews" && <ReviewModeration reviews={reviews} onModerate={moderateReview} full />}

      {activeTab === "reports" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="panel"><h2 className="panel-title">Sales and revenue report</h2><p className="mt-2 text-sm text-slate-500">Revenue in selected backend default range: <span className="font-black text-leaf-700">{currency(totalReportRevenue)}</span></p><div className="mt-5 overflow-x-auto"><table className="admin-table"><thead><tr><th>Date</th><th>Orders</th><th>Items sold</th><th>Revenue</th></tr></thead><tbody>{(report.report || []).map((row) => <tr key={row._id}><td>{row._id}</td><td>{row.orders}</td><td>{row.itemsSold}</td><td>{currency(row.revenue)}</td></tr>)}</tbody></table></div></div>
          <div className="panel"><h2 className="panel-title">Top products</h2><div className="mt-5 space-y-3">{(report.topProducts || []).map((product) => <div key={product._id} className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-950">{product.name}</p><p className="text-sm text-slate-500">Qty {product.quantity} • {currency(product.revenue)}</p></div>)}</div></div>
        </div>
      )}

      {activeTab === "coupons" && (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="panel h-fit"><h2 className="panel-title">Create coupon</h2><CouponForm form={couponForm} setForm={setCouponForm} onSubmit={saveCoupon} /></div>
          <div className="panel"><h2 className="panel-title">Coupons</h2>{coupons.length ? <div className="mt-5 overflow-x-auto"><table className="admin-table"><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th><th>Status</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon._id}><td className="font-black text-slate-950">{coupon.code}</td><td>{coupon.type}</td><td>{coupon.type === "percent" ? `${coupon.value}%` : currency(coupon.value)}</td><td>{coupon.usedCount || 0}</td><td>{coupon.isActive ? "Active" : "Inactive"}</td></tr>)}</tbody></table></div> : <EmptyState icon="🏷️" title="No coupons yet" message="Create coupon codes for checkout discounts." />}</div>
        </div>
      )}
    </main>
  );
}

function AdminStat({ label, value }) {
  return <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100"><p className="text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-sm font-bold text-slate-400">{label}</p></div>;
}

function ProductForm({ form, setForm, categories, onSubmit, editing, onCancel }) {
  const change = (e) => { const { name, value, type, checked } = e.target; setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value })); };
  return <form onSubmit={onSubmit} className="mt-5 space-y-4"><label className="field-label">Name<input required name="name" value={form.name} onChange={change} className="field" /></label><label className="field-label">Description<textarea required name="description" value={form.description} onChange={change} className="field min-h-24" /></label><div className="grid grid-cols-2 gap-3"><label className="field-label">Price<input required type="number" min="0" name="price" value={form.price} onChange={change} className="field" /></label><label className="field-label">Discount<input type="number" min="0" name="discountPrice" value={form.discountPrice} onChange={change} className="field" /></label></div><div className="grid grid-cols-2 gap-3"><label className="field-label">Stock<input required type="number" min="0" name="stock" value={form.stock} onChange={change} className="field" /></label><label className="field-label">Unit<select name="unit" value={form.unit} onChange={change} className="field">{["kg","g","piece","bundle","liter","packet","dozen"].map((unit) => <option key={unit}>{unit}</option>)}</select></label></div><label className="field-label">Category<select required name="category" value={form.category} onChange={change} className="field"><option value="">Select category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label><label className="field-label">Image URL<input name="image" value={form.image} onChange={change} className="field" /></label><label className="field-label">Tags<input name="tags" value={form.tags} onChange={change} className="field" placeholder="organic, fresh" /></label><div className="grid grid-cols-2 gap-3"><label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={change} className="accent-leaf-600" /> Featured</label><label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input name="isActive" type="checkbox" checked={form.isActive} onChange={change} className="accent-leaf-600" /> Active</label></div><button className="btn-primary w-full">{editing ? "Update product" : "Add product"}</button>{editing && <button type="button" onClick={onCancel} className="btn-outline w-full justify-center">Cancel edit</button>}</form>;
}

function RecentOrders({ orders, onStatus }) {
  if (!orders.length) return <div className="panel"><EmptyState icon="📦" title="No orders found" /></div>;
  return <div className="panel"><h2 className="panel-title">Orders</h2><div className="mt-5 overflow-x-auto"><table className="admin-table"><thead><tr><th>Order</th><th>User</th><th>Date</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id}><td className="font-black text-slate-950">{shortId(order._id)}</td><td>{order.user?.name || "Customer"}</td><td>{formatDate(order.createdAt)}</td><td>{currency(order.totalPrice)}</td><td><StatusBadge status={order.status} /></td><td><select value={order.status} onChange={(e) => onStatus(order._id, e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold outline-none">{["pending","processing","shipped","delivered","cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div></div>;
}

function ReviewModeration({ reviews, onModerate }) {
  if (!reviews.length) return <div className="panel"><EmptyState icon="⭐" title="No reviews found" /></div>;
  return <div className="panel"><h2 className="panel-title">Review moderation</h2><div className="mt-5 space-y-3">{reviews.map((review) => <div key={review._id} className="rounded-3xl bg-slate-50 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-black text-slate-950">{review.product?.name || "Product"}</p><p className="text-sm text-slate-500">{review.user?.name} • {review.rating}★</p></div><StatusBadge status={review.status} /></div><p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => onModerate(review._id, "approve")} className="btn-mini">Approve</button><button onClick={() => onModerate(review._id, "reject")} className="btn-mini">Reject</button><button onClick={() => onModerate(review._id, "delete")} className="btn-mini text-rose-600">Delete</button></div></div>)}</div></div>;
}

function CouponForm({ form, setForm, onSubmit }) {
  const change = (e) => { const { name, value, type, checked } = e.target; setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value })); };
  return <form onSubmit={onSubmit} className="mt-5 space-y-4"><label className="field-label">Code<input required name="code" value={form.code} onChange={change} className="field uppercase" placeholder="FRESH10" /></label><label className="field-label">Description<input name="description" value={form.description} onChange={change} className="field" /></label><div className="grid grid-cols-2 gap-3"><label className="field-label">Type<select name="type" value={form.type} onChange={change} className="field"><option value="percent">Percent</option><option value="fixed">Fixed</option></select></label><label className="field-label">Value<input required type="number" min="0" name="value" value={form.value} onChange={change} className="field" /></label></div><label className="field-label">Minimum order<input type="number" min="0" name="minOrderAmount" value={form.minOrderAmount} onChange={change} className="field" /></label><label className="field-label">Maximum discount<input type="number" min="0" name="maxDiscount" value={form.maxDiscount} onChange={change} className="field" /></label><label className="field-label">Usage limit<input type="number" min="0" name="usageLimit" value={form.usageLimit} onChange={change} className="field" /></label><label className="field-label">Expires at<input type="date" name="expiresAt" value={form.expiresAt} onChange={change} className="field" /></label><label className="flex items-center gap-2 text-sm font-bold text-slate-600"><input name="isActive" type="checkbox" checked={form.isActive} onChange={change} className="accent-leaf-600" /> Active coupon</label><button className="btn-primary w-full">Create coupon</button></form>;
}
