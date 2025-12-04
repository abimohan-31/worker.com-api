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
  getAllProviders,
  getProviderById,
  updateProfileImage,
  deleteProfileImage,
  createWorkImage,
  getAllWorkImages,
  getWorkImageById,
  updateWorkImage,
  deleteWorkImage,
  getPublicWorkImages,
  getPendingProviders,
  getAllProvidersForAdmin,
  approveProvider,
  rejectProvider,
  deleteProvider,
} from "../controllers/providersController.js";

const providersRouter = express.Router();

// Public routes (no authentication required)
providersRouter.get("/public", getAllProviders);
providersRouter.get("/public/:id", getProviderById);
providersRouter.get("/public/:providerId/work-images", getPublicWorkImages);

// Route to check approval status by provider ID (public - no authentication required)
// Allows providers to check their approval status before they can log in
providersRouter.get("/check-approval/:id", checkApprovalStatus);

// Protected routes (require authentication, provider role, and approval)
providersRouter.use(verifyProviderApproval);

// Profile routes (no subscription required)
providersRouter.get(
  "/profile",
  verifyToken,
  verifyRole("provider"),
  getProfile
);
providersRouter.put(
  "/profile",
  verifyToken,
  verifyRole("provider"),
  updateProfile
);

// Profile image routes
providersRouter.patch(
  "/profile/image",
  verifyToken,
  verifyRole("provider"),
  updateProfileImage
);
providersRouter.delete(
  "/profile/image",
  verifyToken,
  verifyRole("provider"),
  deleteProfileImage
);

// Work portfolio routes
providersRouter.post(
  "/work-images",
  verifyToken,
  verifyRole("provider"),
  createWorkImage
);
providersRouter.get(
  "/work-images",
  verifyToken,
  verifyRole("provider"),
  getAllWorkImages
);
providersRouter.get(
  "/work-images/:id",
  verifyToken,
  verifyRole("provider"),
  getWorkImageById
);
providersRouter.put(
  "/work-images/:id",
  verifyToken,
  verifyRole("provider"),
  updateWorkImage
);
providersRouter.delete(
  "/work-images/:id",
  verifyToken,
  verifyRole("provider"),
  deleteWorkImage
);

//get pending providers
providersRouter.get(
  "/pending",
  verifyToken,
  verifyRole("admin"),
  getPendingProviders
);

// Admin routes for providers
providersRouter.get(
  "/admin/all",
  verifyToken,
  verifyRole("admin"),
  getAllProvidersForAdmin
);

providersRouter.patch(
  "/:id/approve",
  verifyToken,
  verifyRole("admin"),
  approveProvider
);

providersRouter.patch(
  "/:id/reject",
  verifyToken,
  verifyRole("admin"),
  rejectProvider
);

providersRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  deleteProvider
);

export default providersRouter;
