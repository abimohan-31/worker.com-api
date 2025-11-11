import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  getAllServices,
  getAllCategories,
  getServicesByCategory,
  getServiceById,
  getProvidersByService,
  createService,
  updateService,
  deleteService,
} from "../controllers/servicesController.js";

const servicesRouter = express.Router();

// Public routes (no authentication required)
servicesRouter.get("/", getAllServices);
servicesRouter.get("/categories", getAllCategories);
servicesRouter.get("/category/:category", getServicesByCategory);
servicesRouter.get("/:id", getServiceById);
servicesRouter.get("/:id/providers", getProvidersByService);

// Providers only routes (require authentication and admin role)
servicesRouter.post("/", verifyToken, verifyRole("provider"), createService);
servicesRouter.put("/:id", verifyToken, verifyRole("provider"), updateService);
servicesRouter.delete("/:id", verifyToken, verifyRole("provider"), deleteService);

export default servicesRouter;
