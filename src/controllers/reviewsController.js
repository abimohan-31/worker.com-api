import Review from "../models/Review.js";
import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";

// GET /api/reviews - Get all reviews
export const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, provider_id, customer_id } = req.query;

    // Build query
    const query = {};
    if (provider_id) query.provider_id = provider_id;
    if (customer_id) query.customer_id = customer_id;

    const reviews = await Review.find(query)
      .populate("customer_id", "name email")
      .populate("provider_id", "name skills")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ review_date: -1 });

    const total = await Review.countDocuments(query);

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

// GET /api/reviews/:id - Get review by ID
export const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate("customer_id", "name email")
      .populate("provider_id", "name skills");

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
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/reviews - Create review (customer or provider)
export const createReview = async (req, res, next) => {
  try {
    const { provider_id, customer_id, rating, comment } = req.body;
    let finalProviderId = provider_id;
    let finalCustomerId = customer_id;

    // Determine IDs based on user role
    if (req.user.role === "customer") {
      // Customers review providers - customer_id comes from logged-in user, provider_id from body
      if (!provider_id) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Provider ID is required",
          errors: [
            { field: "provider_id", message: "Provider ID is required" },
          ],
        });
      }
      finalCustomerId = req.user.id; // Customer ID is automatically set from logged-in user
    } else if (req.user.role === "provider") {
      // Providers can create reviews about customers - provider_id comes from logged-in user, customer_id from body
      if (!customer_id) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Customer ID is required",
          errors: [
            { field: "customer_id", message: "Customer ID is required" },
          ],
        });
      }
      finalProviderId = req.user.id; // Provider ID is automatically set from logged-in user
    }

    if (!rating) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Rating is required",
        errors: [{ field: "rating", message: "Rating is required" }],
      });
    }

    if (!comment) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Comment is required",
        errors: [{ field: "comment", message: "Comment is required" }],
      });
    }

    // Verify provider and customer exist
    const provider = await Provider.findById(finalProviderId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Provider not found",
      });
    }

    const customer = await Customer.findById(finalCustomerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Customer not found",
      });
    }

    const review = new Review({
      provider_id: finalProviderId,
      customer_id: finalCustomerId,
      rating,
      comment,
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("customer_id", "name email")
      .populate("provider_id", "name skills");

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Review created successfully",
      data: {
        review: populatedReview,
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

// PUT /api/reviews/:id - Update review
export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Review not found",
      });
    }

    // Check if user is the author or admin
    if (req.user.role !== "admin") {
      if (
        req.user.role === "customer" &&
        review.customer_id.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only update your own reviews",
        });
      }

      if (
        req.user.role === "provider" &&
        review.provider_id.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only update your own reviews",
        });
      }
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("customer_id", "name email")
      .populate("provider_id", "name skills");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Review updated successfully",
      data: {
        review: populatedReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/reviews/:id - Delete review
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Review not found",
      });
    }

    // Check if user is the author or admin
    if (req.user.role !== "admin") {
      if (
        req.user.role === "customer" &&
        review.customer_id.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only delete your own reviews",
        });
      }

      if (
        req.user.role === "provider" &&
        review.provider_id.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only delete your own reviews",
        });
      }
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
