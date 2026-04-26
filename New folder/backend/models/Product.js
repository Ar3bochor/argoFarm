import mongoose from "mongoose";
import { PRODUCT_UNITS } from "../utils/constants.js";
import { makeSlug } from "../utils/validators.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },
    slug: { type: String, lowercase: true, trim: true, index: true },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },
    discountPrice: { type: Number, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
      index: true,
    },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    unit: { type: String, enum: PRODUCT_UNITS, default: "kg" },
    stock: { type: Number, required: true, default: 0, min: 0, index: true },
    sold: { type: Number, default: 0, min: 0, index: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5, index: true },
    numReviews: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, price: 1, averageRating: -1, sold: -1 });
productSchema.index({ createdAt: -1 });

productSchema.pre("validate", function (next) {
  if (!this.slug && this.name) this.slug = makeSlug(this.name);
  if (!this.image && this.images?.length) this.image = this.images[0];
  next();
});

export default mongoose.model("Product", productSchema);
