import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String, required: true },

    qty: { type: Number, required: true },

    price: { type: Number, required: true },

    image: String,

    // 🌾 Important for KrishiMarket (farmer tracking)
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // 👤 Who placed the order
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📦 Order items
    orderItems: [orderItemSchema],

    // 📍 Shipping address
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      country: { type: String, default: "Bangladesh" },
    },

    // 💳 Payment
    paymentMethod: {
      type: String,
      enum: ["COD", "bKash", "Nagad", "Card"],
      default: "COD",
    },

    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },

    // 💰 Pricing
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },

    // 📊 Status
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);