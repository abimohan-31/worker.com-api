import Service from "../models/Service.js";
import Provider from "../models/Provider.js";
import Review from "../models/Review.js";
import PriceList from "../models/PriceList.js";
import { queryHelper } from "../utils/queryHelper.js";

// GET /api/services - Get all services (public route)
// Supports search, filter, sort, and pagination
// Admin users (if authenticated) can see all services including inactive
export const getAllServices = async (req, res, next) => {
  try {
    // Set default filter for active services if not specified
    // Admin users can see all services (active and inactive) by not filtering
    const defaultFilters = {};
    // Check if user is authenticated admin - if so, show all services
    // Otherwise, default to active services only
    const isAdmin = req.user && req.user.role === "admin";
    if (req.query.isActive === undefined && !isAdmin) {
      defaultFilters.isActive = true;
    }

    const { data, pagination } = await queryHelper(
      Service,
      req.query,
      ["name", "description", "category"], 
      {
        defaultFilters,
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

// GET /api/services/categories - Get all categories (public route)
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Service.distinct("category", { isActive: true });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        categories: categories.sort(),
        count: categories.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/services/category/:category - Get services by category (public route)
// Supports search, filter, sort, and pagination
export const getServicesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    const { data, pagination } = await queryHelper(
      Service,
      { ...req.query, category }, 
      ["name", "description"], 
      {
        defaultFilters: { isActive: true },
      }
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        category,
        services: data,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/services/:id - Get service by ID (public route)
// Includes related reviews (anonymized) and price list
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Service not found",
      });
    }

    // Get providers offering this service (for finding related reviews)
    const skillRegex = new RegExp(service.name, "i");
    const providers = await Provider.find({
      skills: skillRegex, 
      isApproved: true,
    }).select("_id");

    const providerIds = providers.map((p) => p._id);

    // Get reviews for providers offering this service (anonymized for public)
    const reviews = await Review.find({
      provider_id: { $in: providerIds },
    })
      .populate("customer_id", "name") 
      .populate("provider_id", "name skills") 
      .select("-customer_id.email -provider_id.email -provider_id.phone -provider_id.address")
      .sort({ review_date: -1 })
      .limit(25); 

    // Calculate average rating for this service
    const avgRatingResult = await Review.aggregate([
      { $match: { provider_id: { $in: providerIds } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
    const reviewCount = avgRatingResult.length > 0 ? avgRatingResult[0].count : 0;

    // Get price list for this service
    const priceLists = await PriceList.find({
      service_id: id,
      isActive: true,
    }).sort({ createdAt: -1 });

    // Anonymize reviews for public view (remove sensitive provider data)
    const anonymizedReviews = reviews.map((review) => {
      const reviewObj = review.toObject();
      if (reviewObj.provider_id) {
        reviewObj.provider_id = {
          _id: reviewObj.provider_id._id,
          name: reviewObj.provider_id.name,
          skills: reviewObj.provider_id.skills,
        };
      }
      // Keep only customer name, remove email
      if (reviewObj.customer_id) {
        reviewObj.customer_id = {
          _id: reviewObj.customer_id._id,
          name: reviewObj.customer_id.name,
        };
      }
      return reviewObj;
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        service,
        reviews: anonymizedReviews,
        reviewStats: {
          averageRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
          totalReviews: reviewCount,
        },
        priceLists,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/services/:id/providers - Get providers offering a service (public route)
// Supports search, filter, sort, and pagination
// For logged-in customers, includes full provider reviews
export const getProvidersByService = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get service details
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Service not found",
      });
    }

    // Build query to find providers with matching skills
    // Match providers whose skills array contains the service name (case-insensitive)
    const skillRegex = new RegExp(service.name, "i");
    
    // Use queryHelper with custom filter for skills matching
    const queryParams = { ...req.query };
    const defaultFilters = {
      isApproved: true, 
      skills: skillRegex, 
    };

    const { data: providers, pagination } = await queryHelper(
      Provider,
      queryParams,
      ["name", "email", "address"], 
      {
        defaultFilters,
        select: "-password", 
      }
    );

    // For logged-in customers, include provider reviews
    let providersWithReviews = providers;
    if (req.user && req.user.role === "customer") {
      providersWithReviews = await Promise.all(
        providers.map(async (provider) => {
          const reviews = await Review.find({ provider_id: provider._id })
            .populate("customer_id", "name")
            .populate("provider_id", "name skills")
            .sort({ review_date: -1 })
            .limit(5);

          const avgRatingResult = await Review.aggregate([
            { $match: { provider_id: provider._id } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
          ]);

          const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
          const reviewCount = avgRatingResult.length > 0 ? avgRatingResult[0].count : 0;

          return {
            ...provider.toObject(),
            reviews,
            reviewStats: {
              averageRating: Math.round(avgRating * 10) / 10,
              totalReviews: reviewCount,
            },
          };
        })
      );
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        service: {
          _id: service._id,
          name: service.name,
          description: service.description,
          category: service.category,
          base_price: service.base_price,
        },
        providers: providersWithReviews,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/services - Create service (admin only)
export const createService = async (req, res, next) => {
  try {
    const { name, description, category, base_price, unit, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Service name is required",
        errors: [{ field: "name", message: "Service name is required" }],
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Service description is required",
        errors: [
          { field: "description", message: "Service description is required" },
        ],
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Service category is required",
        errors: [
          { field: "category", message: "Service category is required" },
        ],
      });
    }

    if (base_price === undefined) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Base price is required",
        errors: [{ field: "base_price", message: "Base price is required" }],
      });
    }

    const service = new Service({
      name,
      description,
      category,
      base_price,
      unit: unit || "hour",
      icon,
    });

    await service.save();

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Service created successfully",
      data: {
        service,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Service with this name already exists",
        errors: [{ field: "name", message: "already exists" }],
      });
    }
    next(error);
  }
};

// PUT /api/services/:id - Update service (admin only)
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, base_price, unit, icon, isActive } =
      req.body;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Service not found",
      });
    }

    if (name) service.name = name;
    if (description) service.description = description;
    if (category) service.category = category;
    if (base_price !== undefined) service.base_price = base_price;
    if (unit) service.unit = unit;
    if (icon !== undefined) service.icon = icon;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Service updated successfully",
      data: {
        service,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Service with this name already exists",
        errors: [{ field: "name", message: "already exists" }],
      });
    }
    next(error);
  }
};

// DELETE /api/services/:id - Delete service (admin only)
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
