import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { buildProductFilters, getPagination, getProductSort } from "../utils/apiFeatures.js";

/**
 * Resolve a category by ObjectId, slug, or name.
 * Returns the ObjectId or null if not found.
 */
const resolveCategory = async (category) => {
  if (!category) return null;

  // ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(category)) {
    return (await Category.exists({ _id: category })) ? category : null;
  }

  // Slug or name
  const found = await Category.findOne({
    $or: [
      { slug: category.toLowerCase() },
      { name: { $regex: `^${category}$`, $options: "i" } },
    ],
  }).select("_id").lean();

  return found?._id || null;
};

/**
 * @desc    Get all products with filtering, sorting, search, and pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filters = buildProductFilters(req.query);

  // Category filter
  if (req.query.category) {
    const categoryId = await resolveCategory(req.query.category);
    if (!categoryId) {
      return res.json({ success: true, products: [], page, pages: 1, total: 0 });
    }
    filters.category = categoryId;
  }

  // Full-text search (uses Mongo text index — much faster than $regex)
  let sort = getProductSort(req.query.sort);
  if (req.query.keyword || req.query.search || req.query.q) {
    const keyword = (req.query.keyword || req.query.search || req.query.q).trim();

    // Use $text search if the query looks like a full text search
    if (keyword.length >= 2) {
      delete filters.$or; // remove regex fallback built in apiFeatures
      filters.$text = { $search: keyword };
      // Add text score for relevance sorting when no explicit sort is given
      if (!req.query.sort) {
        sort = { score: { $meta: "textScore" }, ...sort };
      }
    }
  }

  const [products, total] = await Promise.all([
    Product.find(filters, req.query.keyword ? { score: { $meta: "textScore" } } : {})
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filters),
  ]);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 8, 20);

  const products = await Product.find({ isActive: true, isFeatured: true })
    .populate("category", "name slug")
    .sort({ sold: -1, averageRating: -1 })
    .limit(limit)
    .lean();

  res.json({ success: true, products });
});

/**
 * @desc    Get related products (same category, exclude current)
 * @route   GET /api/products/:id/related
 * @access  Public
 */
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select("category").lean();
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .populate("category", "name slug")
    .sort({ sold: -1, averageRating: -1 })
    .limit(6)
    .lean();

  res.json({ success: true, products: related });
});

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Try ObjectId first, then slug
  let product;
  if (/^[0-9a-fA-F]{24}$/.test(id)) {
    product = await Product.findById(id)
      .populate("category", "name slug")
      .populate("farmer", "name phone")
      .lean();
  } else {
    product = await Product.findOne({ slug: id, isActive: true })
      .populate("category", "name slug")
      .populate("farmer", "name phone")
      .lean();
  }

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Increment views asynchronously (fire-and-forget, non-blocking)
  Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec();

  res.json({ success: true, data: product });
});

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Admin / Farmer
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (!name || !description || price == null || !category || stock == null) {
    res.status(400);
    throw new Error("Missing required fields: name, description, price, category, stock");
  }

  if (Number(price) < 0) {
    res.status(400);
    throw new Error("Price cannot be negative");
  }

  if (Number(stock) < 0) {
    res.status(400);
    throw new Error("Stock cannot be negative");
  }

  const categoryExists = await Category.exists({ _id: category });
  if (!categoryExists) {
    res.status(400);
    throw new Error("Category not found");
  }

  const product = await Product.create({
    ...req.body,
    farmer: req.body.farmer || (req.user.role === "farmer" ? req.user._id : undefined),
  });

  res.status(201).json({ success: true, data: product });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Admin / Farmer (own products)
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Farmers can only update their own products
  if (req.user.role === "farmer" && product.farmer?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this product");
  }

  // Prevent overwriting protected fields
  delete req.body.sold;
  delete req.body.views;
  delete req.body.averageRating;
  delete req.body.numReviews;

  Object.assign(product, req.body);
  const updated = await product.save();

  res.json({ success: true, data: updated });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.json({ success: true, message: "Product deleted successfully" });
});

/**
 * @desc    Soft-delete (deactivate) a product
 * @route   PATCH /api/products/:id/deactivate
 * @access  Admin
 */
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

  res.json({ success: true, data: product });
});

/**
 * @desc    Reactivate a deactivated product
 * @route   PATCH /api/products/:id/activate
 * @access  Admin
 */
export const activateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});