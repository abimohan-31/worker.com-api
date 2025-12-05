import express from "express";
import { verifyToken, verifyRole, optionalVerifyToken } from "../middleware/authMiddleware.js";
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

// Public routes with optional auth (admin can see all services if authenticated)
servicesRouter.get("/", optionalVerifyToken, getAllServices);
servicesRouter.get("/:id", getServiceById);
// servicesRouter.get("/categories", getAllCategories);
// servicesRouter.get("/category/:category", getServicesByCategory);
// servicesRouter.get("/:id/providers", getProvidersByService); // Must be before /:id

// Providers only routes (require authentication and provider role)
servicesRouter.post("/", verifyToken, verifyRole("admin"), createService);
servicesRouter.put("/:id", verifyToken, verifyRole("admin"), updateService);
servicesRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  deleteService
);

export default servicesRouter;
