// Path: backend/models/User.js
// Description: Mongoose model for managing user accounts, 
// roles, saved addresses, password hashing, 
// and password verification.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Stores a user's saved delivery address.
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: "Bangladesh", trim: true },

    // Marks this address as the user's preferred delivery address.
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Password is hidden from query results by default for security.
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // Role controls user permissions across the application.
    role: {
      type: String,
      enum: ["user", "farmer", "admin"],
      default: "user",
    },

    phone: { type: String, trim: true },

    // Stores multiple delivery addresses for the user.
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// Hashes the password before saving if it has been created or changed.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compares the entered password with the hashed password stored in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);