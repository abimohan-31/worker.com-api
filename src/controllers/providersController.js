import Provider from "../models/Provider.js";
import Subscription from "../models/Subscription.js";
import Review from "../models/Review.js";

// GET /api/providers/check-approval - Check approval status (no approval required)
export const checkApprovalStatus = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.user.id).select("-password");

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
        isApproved: provider.isApproved,
        message: provider.isApproved
          ? "Your account is approved. You can access all provider features."
          : "Your account is pending approval. Please wait for admin approval.",
        provider: {
          _id: provider._id,
          name: provider.name,
          email: provider.email,
          isApproved: provider.isApproved,
          createdAt: provider.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/providers/profile - Get provider profile
export const getProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.user.id).select("-password");

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

// PUT /api/providers/profile - Update provider profile
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      address,
      experience_years,
      skills,
      availability_status,
    } = req.body;

    const provider = await Provider.findById(req.user.id);

    if (!provider) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Provider not found",
      });
    }

    if (name) provider.name = name;
    if (phone) provider.phone = phone;
    if (address) provider.address = address;
    if (experience_years) provider.experience_years = experience_years;
    if (skills) provider.skills = skills;
    if (availability_status) provider.availability_status = availability_status;

    await provider.save();

    const providerData = provider.toObject();
    delete providerData.password;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: {
        provider: providerData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/providers/subscription - Get provider subscription
export const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      provider_id: req.user.id,
    })
      .populate("provider_id", "name email")
      .sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No subscription found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/providers/reviews - Get provider reviews
export const getReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const reviews = await Review.find({ provider_id: req.user.id })
      .populate("customer_id", "name email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ review_date: -1 });

    const total = await Review.countDocuments({ provider_id: req.user.id });

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

// GET /api/providers/public - Get all approved providers (public route)
export const getAllProviders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const providers = await Provider.find({ isApproved: true })
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ rating: -1, createdAt: -1 });

    const total = await Provider.countDocuments({ isApproved: true });

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

// GET /api/providers/public/:id - Get provider by ID (public route)
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
