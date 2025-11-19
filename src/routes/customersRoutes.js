import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  getAllProviders,
  getProviderById,
} from "../controllers/customersController.js";
import {
  createReview,
  deleteReview,
  updateReview,
} from "../controllers/reviewsController.js";
import {
  getAllServices,
  getProvidersByService,
  getServiceById,
} from "../controllers/servicesController.js";

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
customersRouter.get("/services", getAllServices);
customersRouter.get("/services/:id", getServiceById);
customersRouter.get("/services/:id/providers", getProvidersByService);

//Review Create, update, delete routes (customer)
customersRouter.post("/reviews", createReview);
customersRouter.put("/reviews/:id", updateReview);
customersRouter.delete("reviews/:id", deleteReview);

export default customersRouter;
