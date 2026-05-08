// Path: backend/models/Category.js
// Description: Mongoose model for managing product 
// categories, including slug generation 
// and parent-child category support.

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

    // Slug is used for clean category URLs and search-friendly routing.
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: { type: String, trim: true },
    image: { type: String, trim: true },

    // Allows nested categories, such as "Fruits" under "Fresh Produce".
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Automatically creates a slug from the category name if no slug is provided.
categorySchema.pre("validate", function (next) {
  if (!this.slug && this.name) this.slug = makeSlug(this.name);
  next();
});

export default mongoose.model("Category", categorySchema);