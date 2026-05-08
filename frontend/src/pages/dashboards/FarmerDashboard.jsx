import { useCallback, useEffect, useMemo, useState } from "react";
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
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  stock: "",
  unit: "kg",
  image: "",
  tags: "",
  isFeatured: false,
  isActive: true,
};

const normalizeList = (res, keys = []) => {
  for (const key of keys) {
    if (Array.isArray(res?.data?.[key])) return res.data[key];
    if (Array.isArray(res?.[key])) return res[key];
  }

  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;

  return [];
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const ownsProduct = (product, userId) => {
  if (!userId) return true;

  const ownerIds = [
    product.farmer,
    product.farmerId,
    product.owner,
    product.ownerId,
    product.seller,
    product.sellerId,
    product.createdBy,
    product.user,
  ].map(getId).filter(Boolean);

  // If the backend already returns only this farmer's products and does not
  // include owner fields, do not hide everything on the frontend.
  if (ownerIds.length === 0) return true;

  return ownerIds.includes(userId);
};

const orderContainsFarmerProduct = (order, productIds, userId) => {
  if (productIds.size === 0 && !userId) return true;

  const directFarmerIds = [
    order.farmer,
    order.farmerId,
    order.seller,
    order.sellerId,
  ].map(getId).filter(Boolean);

  if (userId && directFarmerIds.includes(userId)) return true;

  const items = order.items || order.orderItems || order.products || [];

  // If the backend endpoint is already farmer-scoped but does not include
  // item product ids, keep the row instead of producing an empty table.
  if (!Array.isArray(items) || items.length === 0) return directFarmerIds.length === 0;

  return items.some((item) => {
    const productId = getId(item.product || item.productId || item._id);
    const itemFarmerId = getId(item.farmer || item.farmerId || item.seller || item.sellerId);

    return productIds.has(productId) || (userId && itemFarmerId === userId);
  });
};

const getProductPrice = (product) => {
  const discount = Number(product.discountPrice);
  const price = Number(product.price);

  if (Number.isFinite(discount) && discount > 0) return discount;
  if (Number.isFinite(price)) return price;

  return 0;
};

/**
 * FarmerDashboard
 *
 * Dashboard tailored for farmers:
 *  - Manage own products (add, edit, activate/deactivate)
 *  - View orders containing their products when a compatible order endpoint exists
 *  - Sales overview stats
 */
export default function FarmerDashboard() {
  const { user } = useAuth();
  const userId = user?._id || user?.id || "";

  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = useCallback((text) => {
    setMessage(text);
    window.clearTimeout(showMessage.timer);
    showMessage.timer = window.setTimeout(() => setMessage(""), 3500);
  }, []);

  const loadProducts = useCallback(async () => {
    if (typeof productService.getMyProducts === "function") {
      return productService.getMyProducts({ limit: 100 });
    }

    if (typeof productService.getFarmerProducts === "function") {
      return productService.getFarmerProducts({ limit: 100 });
    }

    return productService.getProducts({
      limit: 100,
      farmer: userId || undefined,
      owner: userId || undefined,
      seller: userId || undefined,
    });
  }, [userId]);

  const loadOrders = useCallback(async () => {
    if (typeof orderService.getFarmerOrders === "function") {
      return orderService.getFarmerOrders();
    }

    if (typeof orderService.getMyFarmerOrders === "function") {
      return orderService.getMyFarmerOrders();
    }

    if (typeof orderService.getOrders === "function") {
      return orderService.getOrders({
        farmer: userId || undefined,
        seller: userId || undefined,
      });
    }

    return null;
  }, [userId]);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [productRes, categoryRes] = await Promise.all([
        loadProducts(),
        categoryService.getCategories(),
      ]);

      const farmerProducts = normalizeList(productRes, ["products"])
        .filter((product) => ownsProduct(product, userId));

      setProducts(farmerProducts);
      setCategories(normalizeList(categoryRes, ["categories"]));

      try {
        const orderRes = await loadOrders();
        const productIds = new Set(farmerProducts.map((product) => getId(product)).filter(Boolean));
        const farmerOrders = normalizeList(orderRes, ["orders"])
          .filter((order) => orderContainsFarmerProduct(order, productIds, userId));

        setOrders(farmerOrders);
      } catch {
        // Orders are useful but should not block product management.
        setOrders([]);
      }
    } catch (err) {
      showMessage(getErrorMessage(err, "Could not load dashboard data"));
      setProducts([]);
      setCategories([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [loadOrders, loadProducts, showMessage, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const productPayload = (form) => {
    const price = Number(form.price);
    const stock = Number(form.stock);
    const discountPrice = form.discountPrice === "" ? undefined : Number(form.discountPrice);

    return {
      ...form,
      price,
      discountPrice,
      stock,
      tags: typeof form.tags === "string"
        ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : form.tags,
    };
  };

  const validateProduct = (form) => {
    const price = Number(form.price);
    const stock = Number(form.stock);
    const discountPrice = form.discountPrice === "" ? undefined : Number(form.discountPrice);

    if (!Number.isFinite(price) || price < 0) return "Please enter a valid price.";
    if (!Number.isFinite(stock) || stock < 0) return "Please enter a valid stock quantity.";
    if (discountPrice !== undefined && (!Number.isFinite(discountPrice) || discountPrice < 0)) {
      return "Please enter a valid discount price.";
    }
    if (discountPrice !== undefined && discountPrice > price) {
      return "Discount price cannot be higher than the regular price.";
    }

    return "";
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    const validationError = validateProduct(productForm);
    if (validationError) {
      showMessage(validationError);
      return;
    }

    setSaving(true);

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
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product._id);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      discountPrice: product.discountPrice ?? "",
      category: product.category?._id || product.category || "",
      stock: product.stock ?? "",
      unit: product.unit || "kg",
      image: product.image || "",
      tags: product.tags?.join(", ") || "",
      isFeatured: !!product.isFeatured,
      isActive: product.isActive !== false,
    });
    setActiveTab("products");
  };

  const toggleActive = async (product) => {
    try {
      if (product.isActive !== false) {
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
    total: products.length,
    active: products.filter((product) => product.isActive !== false).length,
    outOfStock: products.filter((product) => Number(product.stock) === 0).length,
    totalSold: products.reduce((sum, product) => sum + (Number(product.sold) || 0), 0),
  }), [products]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  return (
    <main className="page-shell">
      {/* Header */}
      <section className="mb-8 rounded-[2rem] bg-gradient-to-br from-emerald-900 via-green-700 to-lime-500 p-8 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-lime-200">Farmer dashboard</p>
        <h1 className="mt-3 text-4xl font-black">Welcome, {user?.name || "Farmer"} 🌱</h1>
        <p className="mt-2 text-green-100">Manage your produce listings, track stock levels, and monitor what's selling.</p>
      </section>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon="📦" label="Total products" value={stats.total} />
        <Stat icon="✅" label="Active listings" value={stats.active} />
        <Stat icon="⚠️" label="Out of stock" value={stats.outOfStock} color={stats.outOfStock > 0 ? "text-rose-600" : ""} />
        <Stat icon="🛒" label="Total units sold" value={stats.totalSold} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
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
                    {products.slice(0, 5).map((product) => (
                      <div key={product._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                        <div>
                          <p className="font-black text-slate-950">{product.name}</p>
                          <p className="text-sm text-slate-500">
                            Stock: {product.stock} {product.unit} • {currency(getProductPrice(product))}
                          </p>
                        </div>
                        <StatusBadge status={product.isActive !== false ? "active" : "inactive"} />
                      </div>
                    ))}

                    {products.length > 5 && (
                      <button type="button" onClick={() => setActiveTab("products")} className="text-sm font-bold text-emerald-600">
                        View all {products.length} products →
                      </button>
                    )}
                  </div>
                )}
          </div>

          <div className="panel">
            <h2 className="panel-title">Quick actions</h2>
            <div className="mt-5 grid gap-3">
              <button type="button" onClick={() => setActiveTab("products")} className="quick-action text-left">🌿 Add new product</button>
              <button type="button" onClick={() => setActiveTab("orders")} className="quick-action text-left">📦 View orders</button>
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
                  <input required type="number" min="0" step="0.01" name="price" value={productForm.price} onChange={change} className="field" />
                </label>

                <label className="field-label">Discount price
                  <input type="number" min="0" step="0.01" name="discountPrice" value={productForm.discountPrice} onChange={change} className="field" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="field-label">Stock
                  <input required type="number" min="0" step="1" name="stock" value={productForm.stock} onChange={change} className="field" />
                </label>

                <label className="field-label">Unit
                  <select name="unit" value={productForm.unit} onChange={change} className="field">
                    {["kg", "g", "piece", "bundle", "liter", "packet", "dozen"].map((unit) => <option key={unit}>{unit}</option>)}
                  </select>
                </label>
              </div>

              <label className="field-label">Category
                <select required name="category" value={productForm.category} onChange={change} className="field">
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
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

              <button disabled={saving} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Saving..." : editingProduct ? "Update product" : "Add product"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm(emptyProduct);
                  }}
                  className="btn-outline w-full justify-center"
                >
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
                          <th>Product</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Sold</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {products.map((product) => (
                          <tr key={product._id}>
                            <td className="font-black text-slate-950">{product.name}</td>
                            <td>{product.category?.name || "—"}</td>
                            <td>{currency(getProductPrice(product))}</td>
                            <td className={Number(product.stock) === 0 ? "text-rose-600 font-bold" : ""}>{product.stock} {product.unit}</td>
                            <td>{product.sold || 0}</td>
                            <td><StatusBadge status={product.isActive !== false ? "active" : "inactive"} /></td>
                            <td>
                              <button type="button" onClick={() => editProduct(product)} className="btn-mini">Edit</button>
                              <button
                                type="button"
                                onClick={() => toggleActive(product)}
                                className={`btn-mini ml-2 ${product.isActive !== false ? "text-amber-600" : "text-emerald-600"}`}
                              >
                                {product.isActive !== false ? "Deactivate" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
          </div>
        </div>
      )}

      {/* Orders */}
      {activeTab === "orders" && (
        <div className="panel">
          <h2 className="panel-title">Orders containing your products</h2>
          <p className="mt-2 text-sm text-slate-500">
            This view lists orders returned by the farmer order endpoint, or filters general orders by your product ids when available.
          </p>

          {loading
            ? <p className="mt-4 text-sm text-slate-400">Loading...</p>
            : orders.length === 0
              ? (
                <EmptyState
                  icon="📦"
                  title="No farmer orders found"
                  message="No matching orders were returned yet. If orders exist, connect this tab to a farmer-specific backend order endpoint."
                />
              )
              : (
                <div className="mt-5 overflow-x-auto">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => {
                        const items = order.items || order.orderItems || order.products || [];
                        const total = order.totalPrice ?? order.totalAmount ?? order.total ?? order.grandTotal ?? 0;
                        const customer = order.user?.name || order.customer?.name || order.shippingAddress?.fullname || "—";

                        return (
                          <tr key={order._id || order.id}>
                            <td className="font-black text-slate-950">#{shortId(order._id || order.id)}</td>
                            <td>{formatDate(order.createdAt || order.orderDate || order.date)}</td>
                            <td>{customer}</td>
                            <td>{Array.isArray(items) ? items.length : "—"}</td>
                            <td>{currency(total)}</td>
                            <td><StatusBadge status={order.status || order.orderStatus || "pending"} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
