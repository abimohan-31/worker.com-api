import express from "express";
import { verifyToken, verifyRole, optionalVerifyToken } from "../middleware/authMiddleware.js";
import {
  getAllPriceLists,
  getPriceListByService,
  getPriceListById,
  createPriceList,
  updatePriceList,
  deletePriceList,
} from "../controllers/priceListController.js";

const priceListRouter = express.Router();

// Public routes with optional auth (admin can see all price lists if authenticated)
priceListRouter.get("/", optionalVerifyToken, getAllPriceLists);
priceListRouter.get("/service/:serviceId", getPriceListByService);
priceListRouter.get("/:id", getPriceListById);

// Admin only routes (require authentication and admin role)
priceListRouter.post("/", verifyToken, verifyRole("admin"), createPriceList);
priceListRouter.put("/:id", verifyToken, verifyRole("admin"), updatePriceList);
priceListRouter.delete(
  "/:id",
  verifyToken,
  verifyRole("admin"),
  deletePriceList
);

export default priceListRouter;

