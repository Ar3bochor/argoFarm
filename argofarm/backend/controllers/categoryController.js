import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import { requiredFields } from "../utils/validators.js";

export const getCategories = asyncHandler(async (req, res) => {
  const filters = req.query.includeInactive === "true" ? {} : { isActive: true };
  const categories = await Category.find(filters).sort({ name: 1 }).lean();
  res.json(categories);
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).lean();
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(category);
});

export const createCategory = asyncHandler(async (req, res) => {
  requiredFields(req.body, ["name"]);
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  await category.deleteOne();
  res.json({ message: "Category deleted successfully" });
});
