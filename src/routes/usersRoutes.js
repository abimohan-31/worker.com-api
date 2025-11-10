import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import {
	register,
	login,
	createUser,
	getUserById,
	updateUser,
	deleteUser,
} from "../controllers/UsersController.js";

const usersRouter = express.Router();

// Public
usersRouter.post("/register", register); // provider & customer
usersRouter.post("/login", login); // all roles

// Admin only
usersRouter.post("/create", authenticate, authorize("admin"), createUser);

// Basic user management (protected)
usersRouter.get("/:id", authenticate, getUserById);
usersRouter.put("/:id", authenticate, updateUser);
usersRouter.delete("/:id", authenticate, authorize("admin"), deleteUser);

export default usersRouter;


