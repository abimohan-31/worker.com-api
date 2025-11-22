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
import {
  getAllJobPosts,
  getJobPostById,
  createJobPost,
  updateJobPost,
  approveApplication,
  rejectApplication,
  deleteJobPost,
} from "../controllers/jobPostsController.js";

const customersRouter = express.Router();

// All routes require authentication
customersRouter.use(verifyToken);

// Profile routes
customersRouter.get("/profile", getProfile);
customersRouter.put("/profile", updateProfile);

// Provider viewing routes
customersRouter.get("/services", getAllServices);
customersRouter.get("/services/:id", getServiceById);
customersRouter.get("/services/:id/providers", getProvidersByService);

// Job Posts routes (customer-owned)
customersRouter.get("/job-posts", getAllJobPosts); // Customers see their own, providers/admin see all
customersRouter.get("/job-posts/:id", getJobPostById);
customersRouter.post("/job-posts", verifyRole("customer"), createJobPost);
customersRouter.put("/job-posts/:id", updateJobPost); // Customer (own) or Admin (any)
customersRouter.put(
  "/job-posts/:id/applications/:applicationId/approve",
  verifyRole("customer"),
  approveApplication
);
customersRouter.put(
  "/job-posts/:id/applications/:applicationId/reject",
  verifyRole("customer"),
  rejectApplication
);
customersRouter.delete("/job-posts/:id", deleteJobPost); // Customer (own) or Admin (any)

export default customersRouter;
