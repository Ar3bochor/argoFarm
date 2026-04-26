import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { normalizeEmail } from "../utils/validators.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  addresses: user.addresses,
  token: generateToken(user._id, user.role),
});

export const register = async ({ name, email, password, role, phone }) => {
  const normalizedEmail = normalizeEmail(email);
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) throw new Error("User already exists");

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || "user",
    phone,
  });

  return sanitizeUser(user);
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+password");
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  return sanitizeUser(user);
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found");

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) throw new Error("Wrong current password");

  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
};
