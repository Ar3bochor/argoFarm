export const currency = (value = 0) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

export const shortId = (id = "") => id ? `#${String(id).slice(-6).toUpperCase()}` : "#------";

export const formatDate = (date) => {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;

export const productImage = (product) =>
  product?.image || product?.images?.[0] ||
  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80";

export const statusSteps = ["pending", "processing", "shipped", "delivered"];

export const deliverySlots = [
  { label: "Today Morning", time: "09:00 AM - 12:00 PM", offset: 0 },
  { label: "Today Evening", time: "04:00 PM - 08:00 PM", offset: 0 },
  { label: "Tomorrow Morning", time: "09:00 AM - 12:00 PM", offset: 1 },
  { label: "Tomorrow Evening", time: "04:00 PM - 08:00 PM", offset: 1 }
];

export const makeDeliverySlot = (slot) => {
  const date = new Date();
  date.setDate(date.getDate() + Number(slot.offset || 0));
  return { label: slot.label, time: slot.time, date: date.toISOString() };
};
