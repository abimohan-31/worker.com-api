import Provider from "../models/Provider.js";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Review from "../models/Review.js";

// GET /api/admins/providers - Get all providers
export const getAllProviders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const providers = await Provider.find()
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Provider.countDocuments();

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

// GET /api/admins/providers/pending - Get pending providers
export const getPendingProviders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const providers = await Provider.find({ isApproved: false })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Provider.countDocuments({ isApproved: false });

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

// GET /api/admins/providers/:id - Get provider by ID
export const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id).select("-password");

    if (!provider) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Provider not found",
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

// PUT /api/admins/providers/:id/approve - Approve provider
export const approveProvider = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findById(id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Provider not found",
      });
    }

    if (provider.isApproved) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Provider is already approved",
      });
    }

    provider.isApproved = true;
    await provider.save();

    const providerData = provider.toObject();
    delete providerData.password;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Provider approved successfully",
      data: {
        provider: providerData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admins/providers/:id/reject - Reject provider
export const rejectProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const provider = await Provider.findById(id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Provider not found",
      });
    }

    provider.isApproved = false;
    await provider.save();

    const providerData = provider.toObject();
    delete providerData.password;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: reason
        ? `Provider rejected. Reason: ${reason}`
        : "Provider rejected successfully",
      data: {
        provider: providerData,
        rejectionReason: reason || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admins/providers/:id - Delete provider
export const deleteProvider = async (req, res, next) => {
  try {
    const { id } = req.params;

    const provider = await Provider.findByIdAndDelete(id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Provider not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Provider deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admins/customers - Get all customers
export const getAllCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const customers = await Customer.find()
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        customers,
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

// GET /api/admins/customers/:id - Get customer by ID
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id).select("-password");

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

// DELETE /api/admins/customers/:id - Delete customer
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

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
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admins/admins - Get all admins
export const getAllAdmins = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const admins = await User.find({ role: "admin" })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role: "admin" });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        admins,
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

// GET /api/admins/subscriptions - Get all subscriptions
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const subscriptions = await Subscription.find()
      .populate("provider_id", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Subscription.countDocuments();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        subscriptions,
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

// GET /api/admins/reviews - Get all reviews
export const getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find()
      .populate("customer_id", "name email")
      .populate("provider_id", "name skills")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ review_date: -1 });

    const total = await Review.countDocuments();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        reviews,
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

// DELETE /api/admins/reviews/:id - Delete review (remove inappropriate content)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
