import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscriptionsController.js";

const subscriptionsRouter = express.Router();

// All routes require authentication
subscriptionsRouter.use(verifyToken);

// GET routes (admin and provider can view)
subscriptionsRouter.get(
  "/",
  verifyRole("admin", "provider"),
  getAllSubscriptions
);
subscriptionsRouter.get(
  "/:id",
  verifyRole("admin", "provider"),
  getSubscriptionById
);

// Admin only routes
subscriptionsRouter.post("/", verifyRole("admin"), createSubscription);
subscriptionsRouter.put("/:id", verifyRole("admin"), updateSubscription);
subscriptionsRouter.delete("/:id", verifyRole("admin"), deleteSubscription);

export default subscriptionsRouter;
