// Path: backend/models/Order.js
// Description: Mongoose model for storing customer orders,
// including ordered items, shipping details, 
// payment data, order status, and status history.

import mongoose from "mongoose";
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from "../utils/constants.js";

// Stores product details for each item inside an order.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },

    // Kept for compatibility with parts of the app that may use "qty" instead of "quantity".
    qty: { type: Number, min: 1 },

    // Stores the product price at the time the order was placed.
    price: { type: Number, required: true, min: 0 },

    image: String,
    unit: String,

    // Links the ordered item to the farmer or seller who owns the product.
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

// Stores the delivery address used for the order.
const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: "Bangladesh" },
  },
  { _id: false }
);

// Tracks every status update made to the order.
const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUS, required: true },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Order must contain at least one product.
    orderItems: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, "Order must contain at least one item"],
    },

    shippingAddress: addressSchema,

    // Optional delivery schedule selected by the customer.
    deliverySlot: {
      date: Date,
      time: { type: String, trim: true },
      label: { type: String, trim: true },
    },

    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS,
      default: "pending",
    },

    // Stores payment gateway response or transaction details.
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      gateway: String,
      transactionId: String,
    },

    // Stores applied coupon details for this order.
    coupon: {
      code: String,
      discount: { type: Number, default: 0 },
    },

    itemsPrice: { type: Number, required: true, default: 0, min: 0 },
    taxPrice: { type: Number, default: 0, min: 0 },
    shippingPrice: { type: Number, default: 0, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, required: true, default: 0, min: 0 },

    status: {
      type: String,
      enum: ORDER_STATUS,
      default: "pending",
      index: true,
    },

    statusHistory: [statusHistorySchema],

    isPaid: { type: Boolean, default: false },
    paidAt: Date,

    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
  },
  { timestamps: true }
);

// Normalizes order data before validation and keeps status/payment flags in sync.
orderSchema.pre("validate", function (next) {
  this.orderItems = this.orderItems.map((item) => {
    const plainItem = typeof item.toObject === "function" ? item.toObject() : item;

    return {
      ...plainItem,
      qty: plainItem.qty || plainItem.quantity,
      quantity: plainItem.quantity || plainItem.qty,
    };
  });

  // Adds the first status history entry when a new order is created.
  if (!this.statusHistory?.length) {
    this.statusHistory = [{ status: this.status || "pending", note: "Order placed" }];
  }

  // Automatically marks the order as delivered when status becomes delivered.
  if (this.status === "delivered") {
    this.isDelivered = true;
    this.deliveredAt = this.deliveredAt || new Date();
  }

  // Automatically marks the order as paid when payment status becomes paid.
  if (this.paymentStatus === "paid") {
    this.isPaid = true;
    this.paidAt = this.paidAt || new Date();
  }

  next();
});

// Indexes improve query performance for user order history and admin status filtering.
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);