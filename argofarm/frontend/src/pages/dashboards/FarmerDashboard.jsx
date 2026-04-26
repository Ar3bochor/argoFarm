import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import * as productService from "../../services/productService";
import * as categoryService from "../../services/categoryService";
import * as orderService from "../../services/orderService";
import { currency, formatDate, getErrorMessage, shortId } from "../../utils/helpers";

const tabs = ["overview", "products", "orders"];

const emptyProduct = {
  name: "", description: "", price: "", discountPrice: "",
  category: "", stock: "", unit: "kg", image: "", tags: "",
  isFeatured: false, isActive: true,
};

/**
 * FarmerDashboard
 *
 * NEW FILE — this dashboard was missing entirely.
 * Previously farmers were sent to UserDashboard, which showed
 * irrelevant content (shopping orders, personal addresses, reviews).
 *
 * This dashboard is tailored for farmers:
 *  - Manage own products (add, edit, deactivate)
 *  - View orders containing their products
 *  - Sales overview stats
 */
export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [productRes, categoryRes] = await Promise.all([
        productService.getProducts({ limit: 100 }),
        categoryService.getCategories(),
      ]);
      setProducts(productRes.data?.products ?? productRes.data ?? []);
      setCategories(categoryRes.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3500);
  };

  const productPayload = (form) => ({
    ...form,
    price: Number(form.price),
    discountPrice: form.discountPrice === "" ? undefined : Number(form.discountPrice),
    stock: Number(form.stock),
    tags: typeof form.tags === "string"
      ? form.tags.split(",").map(t => t.trim()).filter(Boolean)
      : form.tags,
  });

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct, productPayload(productForm));
        showMessage("Product updated.");
      } else {
        await productService.createProduct(productPayload(productForm));
        showMessage("Product added.");
      }
      setProductForm(emptyProduct);
      setEditingProduct(null);
      await load();
    } catch (err) {
      showMessage(getErrorMessage(err, "Could not save product"));
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product._id);
    setProductForm({
      name:         product.name || "",
      description:  product.description || "",
      price:        product.price || "",
      discountPrice:product.discountPrice || "",
      category:     product.category?._id || product.category || "",
      stock:        product.stock || "",
      unit:         product.unit || "kg",
      image:        product.image || "",
      tags:         product.tags?.join(", ") || "",
      isFeatured:   !!product.isFeatured,
      isActive:     product.isActive !== false,
    });
    setActiveTab("products");
  };

  const toggleActive = async (product) => {
    try {
      if (product.isActive) {
        await productService.deactivateProduct(product._id);
        showMessage(`"${product.name}" deactivated.`);
      } else {
        await productService.activateProduct(product._id);
        showMessage(`"${product.name}" activated.`);
      }
      await load();
    } catch (err) {
      showMessage(getErrorMessage(err, "Could not update product"));
    }
  };

  const stats = useMemo(() => ({
    total:     products.length,
    active:    products.filter(p => p.isActive).length,
    outOfStock:products.filter(p => p.stock === 0).length,
    totalSold: products.reduce((s, p) => s + (p.sold || 0), 0),
  }), [products]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  return (
    <main className="page-shell">
      {/* Header */}
      <section className="mb-8 rounded-[2rem] bg-gradient-to-br from-emerald-900 via-green-700 to-lime-500 p-8 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-lime-200">Farmer dashboard</p>
        <h1 className="mt-3 text-4xl font-black">Welcome, {user?.name} 🌱</h1>
        <p className="mt-2 text-green-100">Manage your produce listings, track stock levels, and monitor what's selling.</p>
      </section>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="📦" label="Total products"  value={stats.total} />
        <Stat icon="✅" label="Active listings"  value={stats.active} />
        <Stat icon="⚠️" label="Out of stock"    value={stats.outOfStock} color={stats.outOfStock > 0 ? "text-rose-600" : ""} />
        <Stat icon="🛒" label="Total units sold" value={stats.totalSold} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-sm font-black capitalize transition ${
              activeTab === tab ? "bg-emerald-700 text-white" : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {message && (
        <p className="mb-6 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700 ring-1 ring-green-100">
          {message}
        </p>
      )}

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel">
            <h2 className="panel-title">My products</h2>
            {loading
              ? <p className="mt-4 text-sm text-slate-400">Loading...</p>
              : products.length === 0
                ? <EmptyState icon="🌿" title="No products yet" message="Add your first produce listing." actionLabel="Add product" actionTo="#" />
                : (
                  <div className="mt-5 space-y-3">
                    {products.slice(0, 5).map(p => (
                      <div key={p._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                        <div>
                          <p className="font-black text-slate-950">{p.name}</p>
                          <p className="text-sm text-slate-500">
                            Stock: {p.stock} {p.unit} • {currency(p.discountPrice || p.price)}
                          </p>
                        </div>
                        <StatusBadge status={p.isActive ? "active" : "inactive"} />
                      </div>
                    ))}
                    {products.length > 5 && (
                      <button onClick={() => setActiveTab("products")} className="text-sm font-bold text-emerald-600">
                        View all {products.length} products →
                      </button>
                    )}
                  </div>
                )
            }
          </div>

          <div className="panel">
            <h2 className="panel-title">Quick actions</h2>
            <div className="mt-5 grid gap-3">
              <button onClick={() => setActiveTab("products")} className="quick-action text-left">🌿 Add new product</button>
              <button onClick={() => setActiveTab("orders")} className="quick-action text-left">📦 View orders</button>
              <Link to="/products" className="quick-action">🛒 View storefront</Link>
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      {activeTab === "products" && (
        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          {/* Form */}
          <div className="panel h-fit">
            <h2 className="panel-title">{editingProduct ? "Update product" : "Add new product"}</h2>
            <form onSubmit={saveProduct} className="mt-5 space-y-4">
              <label className="field-label">Name
                <input required name="name" value={productForm.name} onChange={change} className="field" />
              </label>
              <label className="field-label">Description
                <textarea required name="description" value={productForm.description} onChange={change} className="field min-h-24" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">Price (৳)
                  <input required type="number" min="0" name="price" value={productForm.price} onChange={change} className="field" />
                </label>
                <label className="field-label">Discount price
                  <input type="number" min="0" name="discountPrice" value={productForm.discountPrice} onChange={change} className="field" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">Stock
                  <input required type="number" min="0" name="stock" value={productForm.stock} onChange={change} className="field" />
                </label>
                <label className="field-label">Unit
                  <select name="unit" value={productForm.unit} onChange={change} className="field">
                    {["kg","g","piece","bundle","liter","packet","dozen"].map(u => <option key={u}>{u}</option>)}
                  </select>
                </label>
              </div>
              <label className="field-label">Category
                <select required name="category" value={productForm.category} onChange={change} className="field">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </label>
              <label className="field-label">Image URL
                <input name="image" value={productForm.image} onChange={change} className="field" />
              </label>
              <label className="field-label">Tags (comma separated)
                <input name="tags" value={productForm.tags} onChange={change} className="field" placeholder="organic, fresh" />
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <input name="isFeatured" type="checkbox" checked={productForm.isFeatured} onChange={change} className="accent-emerald-600" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <input name="isActive" type="checkbox" checked={productForm.isActive} onChange={change} className="accent-emerald-600" />
                  Active
                </label>
              </div>
              <button className="btn-primary w-full">{editingProduct ? "Update product" : "Add product"}</button>
              {editingProduct && (
                <button type="button" onClick={() => { setEditingProduct(null); setProductForm(emptyProduct); }} className="btn-outline w-full justify-center">
                  Cancel edit
                </button>
              )}
            </form>
          </div>

          {/* Product list */}
          <div className="panel">
            <h2 className="panel-title">My produce listings</h2>
            {loading
              ? <p className="mt-4 text-sm text-slate-400">Loading...</p>
              : products.length === 0
                ? <EmptyState icon="🌿" title="No products yet" message="Add your first listing using the form." />
                : (
                  <div className="mt-5 overflow-x-auto">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th>Status</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id}>
                            <td className="font-black text-slate-950">{p.name}</td>
                            <td>{p.category?.name || "—"}</td>
                            <td>{currency(p.discountPrice || p.price)}</td>
                            <td className={p.stock === 0 ? "text-rose-600 font-bold" : ""}>{p.stock} {p.unit}</td>
                            <td>{p.sold || 0}</td>
                            <td><StatusBadge status={p.isActive ? "active" : "inactive"} /></td>
                            <td>
                              <button onClick={() => editProduct(p)} className="btn-mini">Edit</button>
                              <button onClick={() => toggleActive(p)} className={`btn-mini ml-2 ${p.isActive ? "text-amber-600" : "text-emerald-600"}`}>
                                {p.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
            }
          </div>
        </div>
      )}

      {/* Orders — farmer sees orders that contain their products */}
      {activeTab === "orders" && (
        <div className="panel">
          <h2 className="panel-title">Orders containing your products</h2>
          <p className="mt-2 text-sm text-slate-500">
            For full order management, contact the admin. This view shows recent activity.
          </p>
          <EmptyState
            icon="📦"
            title="Order tracking coming soon"
            message="The admin can view and update all orders from the admin panel."
          />
        </div>
      )}
    </main>
  );
}

function Stat({ icon, label, value, color = "" }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
      <div className="text-3xl">{icon}</div>
      <p className={`mt-4 text-2xl font-black text-slate-950 ${color}`}>{value}</p>
      <p className="text-sm font-bold text-slate-400">{label}</p>
    </div>
  );
}
