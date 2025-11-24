import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
} from "../controllers/customersController.js";

const customersRouter = express.Router();

// All routes require authentication
customersRouter.use(verifyToken);

// Profile routes
customersRouter.get(
  "/profile",
  verifyToken,
  verifyRole("customer"),
  getProfile
);
customersRouter.put(
  "/profile",
  verifyToken,
  verifyRole("customer"),
  updateProfile
);

export default customersRouter;
