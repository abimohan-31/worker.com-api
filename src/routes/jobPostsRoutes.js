import express from "express";
import { verifyRole, verifyToken } from "../middleware/authMiddleware.js";
import {
  applyToJobPost,
  approveApplication,
  createJobPost,
  deleteJobPost,
  getAllJobPosts,
  getJobPostById,
  rejectApplication,
  updateJobPost,
} from "../controllers/jobPostsController.js";
const jobPostsRouter = express.Router();

// Job Posts routes (customer-owned)
jobPostsRouter.get(
  "/",
  verifyToken,
  verifyRole(["customer", "provider", "admin"]),
  getAllJobPosts
); // Customers see their own, providers/admin see all
jobPostsRouter.get(
  "/:id",
  verifyToken,
  verifyRole(["customer", "provider", "admin"]),
  getJobPostById
);
jobPostsRouter.post("/", verifyToken, verifyRole("customer"), createJobPost);
jobPostsRouter.put("/:id", verifyToken, verifyRole("customer"), updateJobPost);
jobPostsRouter.put(
  "/:id/applications/:applicationId/approve",
  verifyToken,
  verifyRole("customer"),
  approveApplication
);
jobPostsRouter.put(
  "/:id/applications/:applicationId/reject",
  verifyToken,
  verifyRole("customer"),
  rejectApplication
);
jobPostsRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("customer"),
  deleteJobPost
);
jobPostsRouter.post(
  "/:id/apply",
  verifyToken,
  verifyRole("provider"),
  applyToJobPost
);

export default jobPostsRouter;
