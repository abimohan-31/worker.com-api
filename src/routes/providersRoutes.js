import express from "express";
import {
  verifyToken,
  verifyRole,
  verifyProviderApproval,
} from "../middleware/authMiddleware.js";
import { checkSubscription } from "../middleware/subscriptionMiddleware.js";
import {
  checkApprovalStatus,
  getProfile,
  updateProfile,
  getSubscription,
  getReviews,
  getAllProviders,
  getProviderById,
} from "../controllers/providersController.js";

const providersRouter = express.Router();

// Public routes (no authentication required)
providersRouter.get("/public", getAllProviders);
providersRouter.get("/public/:id", getProviderById);

// Route that requires authentication but NOT approval (for checking status)
providersRouter.get(
  "/check-approval",
  verifyToken,
  verifyRole("provider"),
  checkApprovalStatus
);

// Protected routes (require authentication, provider role, and approval)
providersRouter.use(verifyToken);
providersRouter.use(verifyRole("provider"));
providersRouter.use(verifyProviderApproval);

// Profile routes (no subscription required)
providersRouter.get("/profile", getProfile);
providersRouter.put("/profile", updateProfile);

// Subscription routes (no subscription required to view)
providersRouter.get("/subscription", getSubscription);

// Review routes (require active subscription)
providersRouter.get("/reviews", checkSubscription, getReviews);

export default providersRouter;
