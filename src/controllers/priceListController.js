import PriceList from "../models/PriceList.js";
import Service from "../models/Service.js";
import { queryHelper } from "../utils/queryHelper.js";

/**
 * GET /api/price-list - Get all price lists (public route)
 * Supports search, filter, sort, and pagination
 * Admin users (if authenticated) can see all price lists including inactive
 */
export const getAllPriceLists = async (req, res, next) => {
  try {
    // Admin users can see all price lists (active and inactive)
    // Public users see only active price lists
    const defaultFilters = {};
    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin) {
      defaultFilters.isActive = true;
    }
    
    const { data, pagination } = await queryHelper(
      PriceList,
      req.query,
      ["description"], // Search fields
      {
        defaultFilters,
        populate: {
          path: "service_id",
          select: "name category description",
        },
      }
    );

    return res.status(200).json({
      success: true,
      data,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/price-list/service/:serviceId - Get price list for a specific service (public route)
 */
export const getPriceListByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    // Verify service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Service not found",
      });
    }

    const priceLists = await PriceList.find({
      service_id: serviceId,
      isActive: true,
    })
      .populate("service_id", "name category description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        service: {
          _id: service._id,
          name: service.name,
          category: service.category,
          description: service.description,
        },
        priceLists,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/price-list/:id - Get price list by ID (public route)
 */
export const getPriceListById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const priceList = await PriceList.findById(id).populate(
      "service_id",
      "name category description"
    );

    if (!priceList) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Price list not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        priceList,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/price-list - Create price list (admin only)
 */
export const createPriceList = async (req, res, next) => {
  try {
    const {
      service_id,
      price_type,
      fixed_price,
      unit_price,
      unit,
      min_price,
      max_price,
      description,
      isActive,
    } = req.body;

    // Validate required fields
    if (!service_id) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Service ID is required",
        errors: [{ field: "service_id", message: "Service ID is required" }],
      });
    }

    if (!price_type) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Price type is required",
        errors: [{ field: "price_type", message: "Price type is required" }],
      });
    }

    // Verify service exists
    const service = await Service.findById(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Service not found",
      });
    }

    // Validate price fields based on price_type
    if (price_type === "fixed" && !fixed_price) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Fixed price is required for fixed price type",
        errors: [
          { field: "fixed_price", message: "Fixed price is required" },
        ],
      });
    }

    if (price_type === "per_unit" && !unit_price) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Unit price is required for per_unit price type",
        errors: [{ field: "unit_price", message: "Unit price is required" }],
      });
    }

    if (price_type === "range") {
      if (!min_price || !max_price) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Min and max prices are required for range price type",
          errors: [
            { field: "min_price", message: "Min price is required" },
            { field: "max_price", message: "Max price is required" },
          ],
        });
      }
      if (min_price > max_price) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Min price cannot be greater than max price",
          errors: [
            {
              field: "min_price",
              message: "Min price cannot be greater than max price",
            },
          ],
        });
      }
    }

    const priceList = new PriceList({
      service_id,
      price_type,
      fixed_price,
      unit_price,
      unit: unit || "hour",
      min_price,
      max_price,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    await priceList.save();

    const populatedPriceList = await PriceList.findById(priceList._id).populate(
      "service_id",
      "name category description"
    );

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Price list created successfully",
      data: {
        priceList: populatedPriceList,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Duplicate key error",
        errors: [
          {
            field: Object.keys(error.keyPattern)[0],
            message: "already exists",
          },
        ],
      });
    }
    next(error);
  }
};

/**
 * PUT /api/price-list/:id - Update price list (admin only)
 */
export const updatePriceList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      service_id,
      price_type,
      fixed_price,
      unit_price,
      unit,
      min_price,
      max_price,
      description,
      isActive,
    } = req.body;

    const priceList = await PriceList.findById(id);

    if (!priceList) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Price list not found",
      });
    }

    // Verify service exists if service_id is being updated
    if (service_id) {
      const service = await Service.findById(service_id);
      if (!service) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Service not found",
        });
      }
      priceList.service_id = service_id;
    }

    // Update fields
    if (price_type) priceList.price_type = price_type;
    if (fixed_price !== undefined) priceList.fixed_price = fixed_price;
    if (unit_price !== undefined) priceList.unit_price = unit_price;
    if (unit) priceList.unit = unit;
    if (min_price !== undefined) priceList.min_price = min_price;
    if (max_price !== undefined) priceList.max_price = max_price;
    if (description !== undefined) priceList.description = description;
    if (isActive !== undefined) priceList.isActive = isActive;

    // Validate price fields based on price_type
    if (priceList.price_type === "range") {
      if (
        priceList.min_price !== undefined &&
        priceList.max_price !== undefined &&
        priceList.min_price > priceList.max_price
      ) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Min price cannot be greater than max price",
          errors: [
            {
              field: "min_price",
              message: "Min price cannot be greater than max price",
            },
          ],
        });
      }
    }

    await priceList.save();

    const populatedPriceList = await PriceList.findById(priceList._id).populate(
      "service_id",
      "name category description"
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Price list updated successfully",
      data: {
        priceList: populatedPriceList,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/price-list/:id - Delete price list (admin only)
 */
export const deletePriceList = async (req, res, next) => {
  try {
    const { id } = req.params;

    const priceList = await PriceList.findByIdAndDelete(id);

    if (!priceList) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Price list not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Price list deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

