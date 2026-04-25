import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import { categories, products } from "./dummyData.js";

dotenv.config();
await connectDB();

const importData = async () => {
  await Promise.all([
    Category.deleteMany(),
    Product.deleteMany(),
    Coupon.deleteMany(),
  ]);

  let admin = await User.findOne({ email: "admin@krishimart.com" });
  if (!admin) {
    admin = await User.create({
      name: "KrishiMart Admin",
      email: "admin@krishimart.com",
      password: "admin123",
      role: "admin",
    });
  }

  const createdCategories = await Category.insertMany(categories);
  const vegetable = createdCategories.find((item) => item.name === "Vegetables");
  const seeds = createdCategories.find((item) => item.name === "Seeds");

  await Product.insertMany(
    products.map((product) => ({
      ...product,
      category: product.name.includes("Seeds") ? seeds._id : vegetable._id,
      farmer: admin._id,
    }))
  );

  await Coupon.create({
    code: "KRISHI10",
    type: "percent",
    value: 10,
    minOrderAmount: 300,
    maxDiscount: 150,
    isActive: true,
  });

  console.log("Seed data imported successfully");
  process.exit();
};

const destroyData = async () => {
  await Promise.all([
    Category.deleteMany(),
    Product.deleteMany(),
    Coupon.deleteMany(),
  ]);
  console.log("Seed data removed successfully");
  process.exit();
};

if (process.argv[2] === "-d") destroyData();
else importData();
