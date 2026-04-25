// src/pages/Checkout.jsx
export default function Checkout() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <select className="border p-2 mt-4">
        <option>Cash on Delivery</option>
        <option>bKash</option>
      </select>

      <button className="bg-green-600 text-white px-4 py-2 mt-4">
        Place Order
      </button>
    </div>
  );
}