import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import OrderTimeline from "../components/OrderTimeline";
import StatusBadge from "../components/StatusBadge";
import { PageLoader } from "../components/Loader";
import * as orderService from "../services/orderService";
import { currency, formatDate, productImage, shortId } from "../utils/helpers";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [orderRes, trackRes] = await Promise.all([orderService.getOrderById(id), orderService.trackOrder(id)]);
        setOrder(orderRes.data?.data ?? orderRes.data);
        setTracking(trackRes.data?.data ?? trackRes.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <PageLoader label="Loading order details..." />;
  if (!order) return <main className="page-shell"><EmptyState icon="📦" title="Order not found" message="We could not open this order." actionLabel="Back to dashboard" actionTo="/dashboard" /></main>;

  return (
    <main className="page-shell">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Order tracking</p>
          <h1 className="page-title">Order {shortId(order._id)}</h1>
          <p className="page-subtitle">Placed on {formatDate(order.createdAt)} • {order.paymentMethod}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <OrderTimeline status={tracking?.status || order.status} history={tracking?.statusHistory || order.statusHistory} />
          <div className="panel">
            <h2 className="panel-title">Items</h2>
            <div className="mt-5 space-y-4">
              {order.orderItems.map((item) => (
                <div key={`${item.product?._id || item.product}-${item.name}`} className="flex gap-4 rounded-3xl bg-slate-50 p-4">
                  <img src={productImage(item.product || item)} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <p className="font-black text-slate-950">{item.name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity} • {item.unit}</p>
                  </div>
                  <p className="font-black text-leaf-700">{currency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="panel">
            <h2 className="panel-title">Payment summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Items</span><span className="font-bold">{currency(order.itemsPrice)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-bold">{currency(order.shippingPrice)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-bold">{currency(order.taxPrice)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-bold text-leaf-700">− {currency(order.discountPrice)}</span></div>
              <div className="flex justify-between border-t border-slate-100 pt-4 text-lg"><span className="font-black">Total</span><span className="font-black text-leaf-700">{currency(order.totalPrice)}</span></div>
            </div>
          </div>
          <div className="panel">
            <h2 className="panel-title">Delivery address</h2>
            <p className="mt-4 font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
            <p className="mt-1 text-sm text-slate-400">{order.shippingAddress?.phone}</p>
          </div>
          <Link to="/dashboard" className="btn-outline w-full justify-center">Back to dashboard</Link>
        </aside>
      </div>
    </main>
  );
}
