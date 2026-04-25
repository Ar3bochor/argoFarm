import mongoose from "mongoose";
import { makeSlug } from "../utils/validators.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) this.slug = makeSlug(this.name);
  next();
});

export default mongoose.model("Category", categorySchema);
