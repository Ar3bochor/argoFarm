import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddressForm from "../components/AddressForm";
import EmptyState from "../components/EmptyState";
import useCart from "../hooks/useCart";
import * as userService from "../services/userService";
import * as orderService from "../services/orderService";
import { currency, deliverySlots, getErrorMessage, makeDeliverySlot } from "../utils/helpers";

const paymentMethods = ["COD", "bKash", "Nagad", "Card", "Stripe", "SSLCommerz"];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const deliverySlot = useMemo(() => makeDeliverySlot(deliverySlots[selectedSlot]), [selectedSlot]);

  const loadAddresses = async () => {
    const { data } = await userService.getAddresses();
    setAddresses(data || []);
    const defaultAddress = data?.find((addr) => addr.isDefault) || data?.[0];
    if (defaultAddress) setSelectedAddress(defaultAddress._id);
  };

  useEffect(() => {
    loadAddresses().catch(() => setAddresses([]));
  }, []);

  useEffect(() => {
    if (!cart?.items?.length) return;
    const loadSummary = async () => {
      try {
        const { data } = await orderService.getOrderSummary({ deliverySlot, paymentMethod, couponCode: cart?.coupon?.code });
        setSummary(data);
      } catch {
        setSummary(null);
      }
    };
    loadSummary();
  }, [cart?.items?.length, cart?.coupon?.code, deliverySlot, paymentMethod]);

  const addAddress = async (payload) => {
    await userService.addAddress(payload);
    await loadAddresses();
    setShowAddressForm(false);
  };

  const placeOrder = async () => {
    setMessage("");
    if (!selectedAddress) {
      setMessage("Please select or add a delivery address.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await orderService.createOrder({ addressId: selectedAddress, deliverySlot, paymentMethod, couponCode: cart?.coupon?.code });
      await refreshCart();
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      setMessage(getErrorMessage(err, "Could not place order"));
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items?.length) {
    return <main className="page-shell"><EmptyState icon="🧺" title="Checkout needs cart items" message="Your cart is empty. Add products before placing an order." actionLabel="Shop now" actionTo="/products" /></main>;
  }

  return (
    <main className="page-shell">
      <div className="mb-8">
        <p className="eyebrow">Checkout</p>
        <h1 className="page-title">Address, delivery, payment</h1>
        <p className="page-subtitle">Confirm your delivery address, select a time slot, view summary, and place a secure order.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
        <section className="space-y-6">
          <div className="panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="panel-title">Delivery address</h2>
              <button onClick={() => setShowAddressForm((v) => !v)} className="btn-outline">{showAddressForm ? "Close" : "Add address"}</button>
            </div>
            {showAddressForm && <div className="mb-6 rounded-3xl bg-leaf-50 p-5"><AddressForm onSubmit={addAddress} submitLabel="Add delivery address" /></div>}
            {addresses.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {addresses.map((address) => (
                  <label key={address._id} className={`cursor-pointer rounded-3xl border p-5 transition ${selectedAddress === address._id ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-100" : "border-slate-100 bg-white hover:border-leaf-200"}`}>
                    <input type="radio" checked={selectedAddress === address._id} onChange={() => setSelectedAddress(address._id)} className="sr-only" />
                    <div className="flex items-center justify-between">
                      <p className="font-black text-slate-950">{address.label || "Address"}</p>
                      {address.isDefault && <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-leaf-700">Default</span>}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-600">{address.fullName}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{address.address}, {address.city}</p>
                    <p className="mt-1 text-sm text-slate-400">{address.phone}</p>
                  </label>
                ))}
              </div>
            ) : <EmptyState icon="📍" title="No address saved" message="Add a delivery address to continue checkout." />}
          </div>

          <div className="panel">
            <h2 className="panel-title">Delivery time slot</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {deliverySlots.map((slot, index) => (
                <label key={slot.label} className={`cursor-pointer rounded-3xl border p-5 transition ${selectedSlot === index ? "border-leaf-600 bg-leaf-50 ring-2 ring-leaf-100" : "border-slate-100 bg-white hover:border-leaf-200"}`}>
                  <input type="radio" checked={selectedSlot === index} onChange={() => setSelectedSlot(index)} className="sr-only" />
                  <p className="font-black text-slate-950">{slot.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{slot.time}</p>
                </label>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2 className="panel-title">Payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paymentMethods.map((method) => (
                <label key={method} className={`cursor-pointer rounded-2xl border px-4 py-3 text-center text-sm font-black transition ${paymentMethod === method ? "border-leaf-600 bg-leaf-600 text-white" : "border-slate-100 bg-white text-slate-600 hover:border-leaf-200"}`}>
                  <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="sr-only" />
                  {method}
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-500">Payment gateways are backend-ready placeholders for SSLCommerz/Stripe-style integration.</p>
          </div>
        </section>

        <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-100 lg:sticky lg:top-28">
          <h2 className="text-2xl font-black text-slate-950">Final summary</h2>
          <div className="mt-5 max-h-64 space-y-3 overflow-auto pr-1">
            {(summary?.items || cart.items).map((item) => (
              <div key={item.product?._id || item.product} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-600">{item.name} × {item.quantity}</span>
                <span className="font-bold text-slate-900">{currency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Items</span><span className="font-bold">{currency(summary?.itemsPrice || cart.itemsPrice)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-bold">{currency(summary?.shippingPrice || 0)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-bold">{currency(summary?.taxPrice || 0)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-bold text-leaf-700">− {currency(summary?.discountPrice || cart.discountPrice)}</span></div>
            <div className="flex justify-between border-t border-slate-100 pt-4 text-lg"><span className="font-black text-slate-950">Total</span><span className="font-black text-leaf-700">{currency(summary?.totalPrice || cart.totalPrice)}</span></div>
          </div>
          <div className="mt-5 rounded-2xl bg-leaf-50 p-4 text-sm text-slate-600">
            <p className="font-black text-slate-900">{deliverySlot.label}</p>
            <p>{deliverySlot.time}</p>
            <p className="mt-1 font-bold">Payment: {paymentMethod}</p>
          </div>
          {message && <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p>}
          <button onClick={placeOrder} disabled={loading} className="btn-primary mt-6 w-full justify-center py-4 disabled:opacity-60">{loading ? "Placing order..." : "Place order"}</button>
          <Link to="/cart" className="mt-3 block text-center text-sm font-bold text-slate-500 hover:text-leaf-700">Back to cart</Link>
        </aside>
      </div>
    </main>
  );
}
