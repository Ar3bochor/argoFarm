// Path: backend/models/Cart.js
// Description: Mongoose model for storing a user's 
// shopping cart, including cart items, coupon data, 
// and calculated item totals.

import mongoose from "mongoose";

// Defines each product item stored inside the cart.
const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Quantity must be at least 1 for every cart item.
    quantity: { type: Number, required: true, min: 1, default: 1 },

    // Stores the product price at the time it was added to the cart.
    price: { type: Number, required: true, min: 0 },

    // Product display details are stored to make cart rendering faster.
    name: { type: String, required: true },
    image: String,
    unit: String,
  },
  { _id: true, timestamps: true }
);

// Main cart schema. Each user should only have one cart.
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    items: [cartItemSchema],

    // Stores applied coupon details, if a coupon is used.
    coupon: {
      code: String,
      discount: { type: Number, default: 0 },
      type: { type: String, enum: ["percent", "fixed"] },
    },
  },
  { timestamps: true }
);

// Calculates the total price of all items before discounts or extra charges.
cartSchema.virtual("itemsPrice").get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Allows virtual fields like itemsPrice to appear in API responses.
cartSchema.set("toJSON", { virtuals: true });
cartSchema.set("toObject", { virtuals: true });

export default mongoose.model("Cart", cartSchema);