import Subscription from "../models/Subscription.js";
import Provider from "../models/Provider.js";
import { queryHelper } from "../utils/queryHelper.js";

// GET /api/subscriptions - Get subscriptions
// Admin: See all subscriptions
// Provider: See only their own subscriptions
// Customer/Public: No access (handled by route middleware)
export const getAllSubscriptions = async (req, res, next) => {
  try {
    let defaultFilters = {};

    // Role-based filtering
    if (req.user.role === "provider") {
      // Providers can only see their own subscriptions
      defaultFilters.provider_id = req.user.id;
    }
    // Admin sees all (no default filter)

    const { data, pagination } = await queryHelper(
      Subscription,
      req.query,
      ["plan_name"], // Search fields
      {
        defaultFilters,
        populate: {
          path: "provider_id",
          select: "name email",
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

// GET /api/subscriptions/:id - Get subscription by ID
// Admin: Can view any subscription
// Provider: Can only view their own subscription
export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id).populate(
      "provider_id",
      "name email"
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Subscription not found",
      });
    }

    // Access control: Providers can only view their own subscriptions
    if (req.user.role === "provider") {
      if (subscription.provider_id._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "Access denied. You can only view your own subscription.",
        });
      }
    }
    // Admin can view any subscription

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

// POST /api/subscriptions - Create subscription (admin only)
export const createSubscription = async (req, res, next) => {
  try {
    const { provider_id, plan_name, start_date, end_date, renewal_date, status, amount } = req.body;

    // Validation
    if (!provider_id) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Provider ID is required",
        errors: [{ field: "provider_id", message: "Provider ID is required" }],
      });
    }

    if (!plan_name) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Plan name is required",
        errors: [{ field: "plan_name", message: "Plan name is required" }],
      });
    }

    if (!end_date) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "End date is required",
        errors: [{ field: "end_date", message: "End date is required" }],
      });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Amount is required",
        errors: [{ field: "amount", message: "Amount is required" }],
      });
    }

    // Verify provider exists
    const provider = await Provider.findById(provider_id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Provider not found",
      });
    }

    const subscription = new Subscription({
      provider_id,
      plan_name,
      start_date: start_date || new Date(),
      end_date,
      renewal_date,
      status: status || "Active",
      amount,
    });

    await subscription.save();

    const populatedSubscription = await Subscription.findById(
      subscription._id
    ).populate("provider_id", "name email");

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Subscription created successfully",
      data: {
        subscription: populatedSubscription,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Duplicate key error: ${field} already exists`,
        errors: [{ field, message: "already exists" }],
      });
    }
    next(error);
  }
};

// PUT /api/subscriptions/:id - Update subscription (admin only)
export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { plan_name, start_date, end_date, renewal_date, status, amount } = req.body;

    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Subscription not found",
      });
    }

    // Update fields
    if (plan_name) subscription.plan_name = plan_name;
    if (start_date) subscription.start_date = start_date;
    if (end_date) subscription.end_date = end_date;
    if (renewal_date !== undefined) subscription.renewal_date = renewal_date;
    if (status) subscription.status = status;
    if (amount !== undefined) subscription.amount = amount;

    await subscription.save();

    const populatedSubscription = await Subscription.findById(
      subscription._id
    ).populate("provider_id", "name email");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Subscription updated successfully",
      data: {
        subscription: populatedSubscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/subscriptions/:id - Delete subscription (admin only)
export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndDelete(id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Subscription not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
