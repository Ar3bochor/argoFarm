import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

const fallbackProducts = [
  {
    _id: "demo-rice",
    name: "Organic Rice",
    price: 80,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    category: "Grains",
    description: "Fresh local rice from Bangladeshi farmers.",
  },
  {
    _id: "demo-tomato",
    name: "Fresh Tomatoes",
    price: 60,
    image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=80",
    category: "Vegetables",
    description: "Farm fresh tomatoes.",
  },
  {
    _id: "demo-potato",
    name: "Local Potatoes",
    price: 35,
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    category: "Vegetables",
    description: "Locally harvested potatoes.",
  },
];

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products.length ? products : fallbackProducts);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json(product);
});
