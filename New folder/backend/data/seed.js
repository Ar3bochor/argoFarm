/**
 * Seed script — populates the DB with sample data for development.
 * Usage: npm run seed
 * WARNING: Wipes existing Users, Products, Categories, Coupons before seeding.
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const users = [
  {
    name: "Admin User",
    email: "admin@argofarm.com",
    password: "admin123",
    role: "admin",
    phone: "01711000001",
  },
  {
    name: "Rahim Farmer",
    email: "rahim@argofarm.com",
    password: "farmer123",
    role: "farmer",
    phone: "01811000002",
  },
  {
    name: "Karim Customer",
    email: "karim@argofarm.com",
    password: "user1234",
    role: "user",
    phone: "01911000003",
  },
];

const categoryNames = [
  { name: "Vegetables", description: "Fresh seasonal vegetables", image: "" },
  { name: "Fruits", description: "Seasonal and exotic fruits", image: "" },
  { name: "Grains & Rice", description: "Rice, wheat, and other grains", image: "" },
  { name: "Spices & Herbs", description: "Fresh and dried spices", image: "" },
  { name: "Dairy & Eggs", description: "Fresh dairy products and eggs", image: "" },
  { name: "Fish & Seafood", description: "Fresh river and sea fish", image: "" },
];

const coupons = [
  {
    code: "WELCOME10",
    description: "10% off your first order",
    type: "percent",
    value: 10,
    minOrderAmount: 200,
    maxDiscount: 100,
    usageLimit: 500,
    isActive: true,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    code: "SAVE50",
    description: "Flat ৳50 off on orders above ৳500",
    type: "fixed",
    value: 50,
    minOrderAmount: 500,
    usageLimit: 200,
    isActive: true,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    code: "FRESH20",
    description: "20% off vegetables and fruits",
    type: "percent",
    value: 20,
    minOrderAmount: 300,
    maxDiscount: 150,
    usageLimit: 100,
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

// Products are built dynamically after categories are inserted
const buildProducts = (categories, farmerId) => {
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));

  return [
    // Vegetables
    {
      name: "Fresh Tomatoes",
      description: "Ripe, juicy tomatoes grown without pesticides. Perfect for curries and salads.",
      price: 60,
      discountPrice: 50,
      category: catMap["Vegetables"],
      farmer: farmerId,
      unit: "kg",
      stock: 200,
      isFeatured: true,
      tags: ["tomato", "vegetable", "fresh", "organic"],
    },
    {
      name: "Potatoes",
      description: "Premium quality potatoes from Munshiganj. Great for all cooking purposes.",
      price: 40,
      category: catMap["Vegetables"],
      farmer: farmerId,
      unit: "kg",
      stock: 500,
      isFeatured: true,
      tags: ["potato", "vegetable", "staple"],
    },
    {
      name: "Brinjal (Eggplant)",
      description: "Tender, glossy brinjal. Ideal for bharta and curry.",
      price: 50,
      category: catMap["Vegetables"],
      farmer: farmerId,
      unit: "kg",
      stock: 150,
      tags: ["brinjal", "eggplant", "vegetable"],
    },
    {
      name: "Green Chilli",
      description: "Locally grown spicy green chillies. Fresh from the farm.",
      price: 80,
      category: catMap["Vegetables"],
      farmer: farmerId,
      unit: "kg",
      stock: 100,
      tags: ["chilli", "spicy", "vegetable"],
    },
    // Fruits
    {
      name: "Himsagar Mango",
      description: "The king of mangoes — sweet, aromatic, and fiberless. Seasonal Rajshahi variety.",
      price: 250,
      discountPrice: 220,
      category: catMap["Fruits"],
      farmer: farmerId,
      unit: "kg",
      stock: 80,
      isFeatured: true,
      tags: ["mango", "himsagar", "fruit", "seasonal"],
    },
    {
      name: "Fresh Bananas",
      description: "Organically grown Sagor bananas. Sweet and nutritious.",
      price: 60,
      category: catMap["Fruits"],
      farmer: farmerId,
      unit: "dozen",
      stock: 300,
      tags: ["banana", "fruit", "organic"],
    },
    {
      name: "Guava",
      description: "Sweet and crunchy guavas from Pirojpur. Rich in Vitamin C.",
      price: 80,
      category: catMap["Fruits"],
      farmer: farmerId,
      unit: "kg",
      stock: 120,
      tags: ["guava", "fruit", "vitamin-c"],
    },
    // Grains
    {
      name: "Miniket Rice",
      description: "Premium long-grain Miniket rice. Low glycemic index, perfect texture when cooked.",
      price: 75,
      category: catMap["Grains & Rice"],
      farmer: farmerId,
      unit: "kg",
      stock: 1000,
      isFeatured: true,
      tags: ["rice", "miniket", "grain", "staple"],
    },
    {
      name: "Wheat Flour (Ata)",
      description: "Stone-ground whole wheat flour. No additives.",
      price: 55,
      category: catMap["Grains & Rice"],
      farmer: farmerId,
      unit: "kg",
      stock: 600,
      tags: ["wheat", "flour", "ata", "grain"],
    },
    // Spices
    {
      name: "Turmeric Powder",
      description: "Pure sun-dried turmeric from Santipur. High curcumin content.",
      price: 180,
      discountPrice: 160,
      category: catMap["Spices & Herbs"],
      farmer: farmerId,
      unit: "kg",
      stock: 200,
      tags: ["turmeric", "spice", "haldi", "organic"],
    },
    {
      name: "Red Chilli Powder",
      description: "Finely ground dried red chilli. Fiery and flavourful.",
      price: 200,
      category: catMap["Spices & Herbs"],
      farmer: farmerId,
      unit: "kg",
      stock: 150,
      tags: ["chilli", "spice", "powder"],
    },
    // Dairy
    {
      name: "Fresh Cow Milk",
      description: "Farm-fresh unpasteurized cow milk. Collected twice daily.",
      price: 70,
      category: catMap["Dairy & Eggs"],
      farmer: farmerId,
      unit: "liter",
      stock: 100,
      isFeatured: true,
      tags: ["milk", "dairy", "fresh", "cow"],
    },
    {
      name: "Country Eggs",
      description: "Free-range deshi eggs. Rich yolk, no antibiotics.",
      price: 120,
      category: catMap["Dairy & Eggs"],
      farmer: farmerId,
      unit: "dozen",
      stock: 500,
      tags: ["egg", "deshi", "free-range", "protein"],
    },
    // Fish
    {
      name: "Hilsa Fish (Ilish)",
      description: "Fresh Padma hilsa — the national fish of Bangladesh. Premium quality.",
      price: 1200,
      category: catMap["Fish & Seafood"],
      farmer: farmerId,
      unit: "kg",
      stock: 30,
      isFeatured: true,
      tags: ["hilsa", "ilish", "fish", "padma", "premium"],
    },
    {
      name: "Rohu Fish",
      description: "Fresh river rohu. Ideal for Bengali curry.",
      price: 280,
      discountPrice: 260,
      category: catMap["Fish & Seafood"],
      farmer: farmerId,
      unit: "kg",
      stock: 80,
      tags: ["rohu", "fish", "river", "bengali"],
    },
  ];
};

// ─── Seed Function ────────────────────────────────────────────────────────────

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
    ]);
    console.log("🧹 Cleared existing Users, Categories, Products, Coupons");

    // Create users (passwords hashed by pre-save hook)
    const createdUsers = await User.insertMany(
      await Promise.all(
        users.map(async (u) => ({
          ...u,
          password: await bcrypt.hash(u.password, 10),
        }))
      )
    );

    const adminUser  = createdUsers.find((u) => u.role === "admin");
    const farmerUser = createdUsers.find((u) => u.role === "farmer");
    console.log(`👤 Created ${createdUsers.length} users`);

    // Create categories
    const createdCategories = await Category.insertMany(categoryNames);
    console.log(`📂 Created ${createdCategories.length} categories`);

    // Create products
    const products = buildProducts(createdCategories, farmerUser._id);
    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Created ${createdProducts.length} products`);

    // Create coupons
    await Coupon.insertMany(coupons);
    console.log(`🏷️  Created ${coupons.length} coupons`);

    console.log("\n─────────────────────────────────────────");
    console.log("✅ Seed complete!\n");
    console.log("Test accounts:");
    console.log(`  Admin   → admin@argofarm.com   / admin123`);
    console.log(`  Farmer  → rahim@argofarm.com   / farmer123`);
    console.log(`  User    → karim@argofarm.com   / user1234`);
    console.log("\nTest coupons: WELCOME10, SAVE50, FRESH20");
    console.log("─────────────────────────────────────────\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();