import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";

// GET /api/customers/profile - Get customer profile
export const getProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user.id).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        customer,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/customers/profile - Update customer profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Customer not found",
      });
    }

    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;

    await customer.save();

    const customerData = customer.toObject();
    delete customerData.password;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: {
        customer: customerData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/providers - Get all approved providers (for customers to view)
export const getAllProviders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { skill, availability_status } = req.query;

    // Build query
    const query = { isApproved: true };
    if (skill) {
      query.skills = { $in: [new RegExp(skill, "i")] };
    }
    if (availability_status) {
      query.availability_status = availability_status;
    }

    const providers = await Provider.find(query)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Provider.countDocuments(query);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
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

// GET /api/customers/providers/:id - Get provider by ID
export const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findOne({
      _id: id,
      isApproved: true,
    }).select("-password");

    if (!provider) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Provider not found or not approved",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        provider,
      },
    });
  } catch (error) {
    next(error);
  }
};
