import express from "express";
import { verifyToken, verifyRole } from "../middleware/authMiddleware.js";
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController.js";
import { getReviews } from "../controllers/providersController.js";

const reviewsRouter = express.Router();

// Public routes (no authentication required)
reviewsRouter.get("/", getAllReviews);
reviewsRouter.get("/:id", getReviewById);

//customer
reviewsRouter.post("/", verifyToken, verifyRole("customer"), createReview);
reviewsRouter.put("/:id", verifyToken, verifyRole("customer"), updateReview);
reviewsRouter.delete("/:id", verifyToken, verifyRole("customer"), deleteReview);

//provider
reviewsRouter.get("/", verifyToken, verifyRole("provider"), getReviews);

export default reviewsRouter;
