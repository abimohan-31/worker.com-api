import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController.js";

const reviewsRouter = express.Router();

// Public routes (no authentication required)
reviewsRouter.get("/", getAllReviews);
reviewsRouter.get("/:id", getReviewById);

// Protected routes (require authentication)
// Create, update, delete routes (customer or provider)
reviewsRouter.post(
  "/",
  verifyToken,
  verifyRole("customer", "provider"),
  createReview
);
reviewsRouter.put(
  "/:id",
  verifyToken,
  verifyRole("customer", "provider", "admin"),
  updateReview
);
reviewsRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("customer", "provider", "admin"),
  deleteReview
);

export default reviewsRouter;
