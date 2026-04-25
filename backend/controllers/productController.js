import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { buildProductFilters, getPagination, getProductSort } from "../utils/apiFeatures.js";
import { requiredFields } from "../utils/validators.js";

const resolveCategory = async (category) => {
  if (!category) return null;

  if (/^[0-9a-fA-F]{24}$/.test(category)) {
    const exists = await Category.exists({ _id: category });
    return exists ? category : null;
  }

  const found = await Category.findOne({
    $or: [{ slug: category }, { name: { $regex: `^${category}$`, $options: "i" } }],
  }).select("_id");

  return found?._id || null;
};

export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filters = buildProductFilters(req.query);

  if (req.query.category) {
    const categoryId = await resolveCategory(req.query.category);
    if (!categoryId) {
      return res.json({ products: [], page, pages: 1, total: 0 });
    }
    filters.category = categoryId;
  }

  const sort = getProductSort(req.query.sort);

  const [products, total] = await Promise.all([
    Product.find(filters)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filters),
  ]);

  res.json({
    products,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate("category", "name slug")
    .sort({ sold: -1, averageRating: -1 })
    .limit(8)
    .lean();
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("farmer", "name")
    .lean();

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  requiredFields(req.body, ["name", "description", "price", "category", "stock"]);

  const product = await Product.create({
    ...req.body,
    farmer: req.body.farmer || (req.user.role === "farmer" ? req.user._id : undefined),
  });

  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  Object.assign(product, req.body);
  const updated = await product.save();
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
});

export const deactivateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});
