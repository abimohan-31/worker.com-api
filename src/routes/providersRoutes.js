import express from "express";
import {
  verifyToken,
  verifyRole,
  verifyProviderApproval,
} from "../middleware/authMiddleware.js";
import {
  checkApprovalStatus,
  getProfile,
  updateProfile,
  getSubscription,
  getAllProviders,
  getProviderById,
} from "../controllers/providersController.js";
import { applyToJobPost } from "../controllers/jobPostsController.js";

const providersRouter = express.Router();

// Public routes (no authentication required)
providersRouter.get("/public", getAllProviders);
providersRouter.get("/public/:id", getProviderById);

// Route to check approval status by provider ID (public - no authentication required)
// Allows providers to check their approval status before they can log in
providersRouter.get("/check-approval/:id", checkApprovalStatus);

// Protected routes (require authentication, provider role, and approval)
providersRouter.use(verifyToken);
providersRouter.use(verifyRole("provider"));
providersRouter.use(verifyProviderApproval);

// Profile routes (no subscription required)
providersRouter.get("/profile", getProfile);
providersRouter.put("/profile", updateProfile);

// Job Post application route
providersRouter.post("/job-posts/:id/apply", applyToJobPost);

export default providersRouter;
