import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  getAllProviders,
  getPendingProviders,
  getProviderById,
  approveProvider,
  rejectProvider,
  deleteProvider,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
  getAllAdmins,
  getAllSubscriptions,
  getAllReviews,
  deleteReview,
} from "../controllers/adminsController.js";
import {
  createService,
  deleteService,
  updateService,
} from "../controllers/servicesController.js";
import {
  createSubscription,
  deleteSubscription,
  updateSubscription,
} from "../controllers/subscriptionsController.js";

const adminsRouter = express.Router();

// All admin routes require authentication and admin role
adminsRouter.use(verifyToken);
adminsRouter.use(verifyRole("admin"));

// Provider management
adminsRouter.get("/providers", getAllProviders);
adminsRouter.get("/providers/pending", getPendingProviders);
adminsRouter.get("/providers/:id", getProviderById);
adminsRouter.put("/providers/:id/approve", approveProvider);
adminsRouter.put("/providers/:id/reject", rejectProvider);
adminsRouter.delete("/providers/:id", deleteProvider);

// Customer management
adminsRouter.get("/customers", getAllCustomers);
adminsRouter.get("/customers/:id", getCustomerById);
adminsRouter.delete("/customers/:id", deleteCustomer);

// Admin management
// adminsRouter.get("/admins", getAllAdmins);

// Subscriptions
adminsRouter.get("/subscriptions", getAllSubscriptions);
adminsRouter.post("/subscriptions", createSubscription);
adminsRouter.delete("/subscriptions/:id", deleteSubscription);
adminsRouter.put("/subscriptions/:id", updateSubscription);

// Reviews (remove inappropriate content)
adminsRouter.get("/reviews", getAllReviews);
adminsRouter.delete("/reviews/:id", deleteReview);

// Services
adminsRouter.post("/services", createService);
adminsRouter.put("/services/:id", updateService);
adminsRouter.post("/services/:id", deleteService);

export default adminsRouter;
