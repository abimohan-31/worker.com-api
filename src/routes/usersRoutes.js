import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  register,
  login,
  logout,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
} from "../controllers/usersController.js";

const usersRouter = express.Router();

// Public routes
usersRouter.post("/register", register); // provider & customer
usersRouter.post("/login", login); // all roles

// Protected routes
usersRouter.post("/logout", verifyToken, logout); // all authenticated users
usersRouter.get("/:id", verifyToken, getUserById); // all authenticated users
usersRouter.put("/:id", verifyToken, updateUser); // all authenticated users (can update own profile)

// Admin only routes
usersRouter.post("/create", verifyToken, verifyRole("admin"), createUser); // admin only
usersRouter.delete("/:id", verifyToken, verifyRole("admin"), deleteUser); // admin only

export default usersRouter;
