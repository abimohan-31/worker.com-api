import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  getAllProviders,
  getProviderById,
} from "../controllers/customersController.js";

const customersRouter = express.Router();

// All customer routes require authentication and customer role
customersRouter.use(verifyToken);
customersRouter.use(verifyRole("customer"));

// Profile routes
customersRouter.get("/profile", getProfile);
customersRouter.put("/profile", updateProfile);

// Provider viewing routes
customersRouter.get("/providers", getAllProviders);
customersRouter.get("/providers/:id", getProviderById);

export default customersRouter;
