// Path: backend/controllers/categoryController.js
// Description: Handles category operations, 
// including listing, viewing, creating, updating, and 
// deleting product categories.

import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import { requiredFields } from "../utils/validators.js";

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  // Returns only active categories unless inactive categories are explicitly requested.
  const filters = req.query.includeInactive === "true" ? {} : { isActive: true };

  const categories = await Category.find(filters).sort({ name: 1 }).lean();

  res.json({ success: true, data: categories });
});

/**
 * @desc    Get a single category by ID
 * @route   GET /api/categories/:id
 * @access  Public
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({ success: true, data: category });
});

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  // Ensures the required category fields are provided before creation.
  requiredFields(req.body, ["name"]);

  const category = await Category.create(req.body);

  res.status(201).json({ success: true, data: category });
});

/**
 * @desc    Update an existing category
 * @route   PUT /api/categories/:id
 * @access  Admin
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  res.json({ success: true, data: category });
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  await category.deleteOne();

  res.json({ success: true, message: "Category deleted successfully" });
});