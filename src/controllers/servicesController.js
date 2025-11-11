import Service from "../models/Service.js";
import Provider from "../models/Provider.js";

// GET /api/services - Get all services (public route)
export const getAllServices = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    } else {
      query.isActive = true; // Default to active services
    }

    const services = await Service.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ category: 1, name: 1 });

    const total = await Service.countDocuments(query);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
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
export const getServicesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const services = await Service.find({
      category: category,
      isActive: true,
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Service.countDocuments({
      category: category,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        category,
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/services/:id - Get service by ID (public route)
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

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        service,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/services/:id/providers - Get providers offering a service (public route)
export const getProvidersByService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Get service details
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Service not found",
      });
    }

    // Find providers who have this service in their skills
    const providers = await Provider.find({
      isApproved: true,
      skills: { $in: [new RegExp(service.name, "i")] },
    })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Provider.countDocuments({
      isApproved: true,
      skills: { $in: [new RegExp(service.name, "i")] },
    });

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
        providers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
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
