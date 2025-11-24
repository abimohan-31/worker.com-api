import express from "express";
import { verifyRole, verifyToken } from "../middleware/authMiddleware";
import {
  approveApplication,
  createJobPost,
  deleteJobPost,
  getAllJobPosts,
  getJobPostById,
  rejectApplication,
  updateJobPost,
} from "../controllers/jobPostsController";
const jobPostsRouter = express.Router();

// Job Posts routes (customer-owned)
jobPostsRouter.get(
  "/job-posts",
  verifyToken,
  verifyRole(["customer", "provider", "admin"]),
  getAllJobPosts
); // Customers see their own, providers/admin see all
jobPostsRouter.get(
  "/job-posts/:id",
  verifyToken,
  verifyRole("customer", "provider"),
  getJobPostById
);
jobPostsRouter.post(
  "/job-posts",
  verifyToken,
  verifyRole("customer"),
  getJobPostById
);
jobPostsRouter.post(
  "/job-posts",
  verifyToken,
  verifyRole("customer"),
  createJobPost
);
jobPostsRouter.put(
  "/job-posts/:id",
  verifyToken,
  verifyRole("customer"),
  updateJobPost
); // Customer (own) or Admin (any)
jobPostsRouter.put(
  "/job-posts/:id/applications/:applicationId/approve",
  verifyToken,
  verifyRole("customer"),
  approveApplication
);
jobPostsRouter.put(
  "/job-posts/:id/applications/:applicationId/reject",
  verifyToken,
  verifyRole("customer"),
  rejectApplication
);
jobPostsRouter.delete(
  "/job-posts/:id",
  verifyToken,
  verifyRole("customer"),
  deleteJobPost
); // Customer (own) or Admin (any)

export default jobPostsRouter;
