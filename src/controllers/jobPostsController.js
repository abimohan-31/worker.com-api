import JobPost from "../models/JobPost.js";
import Service from "../models/Service.js";
import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";
import { queryHelper } from "../utils/queryHelper.js";

/**
 * GET /api/job-posts - Get all job posts
 * - Providers: See all approved job posts (no skill filtering)
 * - Customers: See their own posts
 * - Admin: See all posts
 * - Public: Cannot access (handled by route middleware)
 */
export const getAllJobPosts = async (req, res, next) => {
  try {
    let defaultFilters = {};

    // Role-based filtering
    if (req.user.role === "provider") {
      // Providers can see all approved job posts
      defaultFilters.status = "Approved";
    } else if (req.user.role === "customer") {
      // Customers can only see their own posts
      defaultFilters.posted_by = req.user.id;
    }
    // Admin sees all (no default filter)

    const { data, pagination } = await queryHelper(
      JobPost,
      req.query,
      ["title", "description", "location", "duration"], // Search fields
      {
        defaultFilters,
        populate: [
          { path: "service_id", select: "name category description" },
          { path: "posted_by", select: "name email" },
          { path: "applied_providers", select: "name email skills" },
        ],
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
 * GET /api/job-posts/:id - Get job post by ID
 */
export const getJobPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobPost = await JobPost.findById(id)
      .populate("service_id", "name category description")
      .populate("posted_by", "name email")
      .populate("applied_providers", "name email skills phone");

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Job post not found",
      });
    }

    // Access control
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Authentication required",
      });
    }

    if (req.user.role === "admin") {
      // Admin can see all
    } else if (req.user.role === "customer") {
      // Customer can only see their own posts
      if (jobPost.posted_by._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only view your own job posts",
        });
      }
    } else if (req.user.role === "provider") {
      // Provider can only see approved posts
      if (jobPost.status !== "Approved") {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "This job post is not approved yet",
        });
      }
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        jobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/job-posts - Create job post (customer only)
 */
export const createJobPost = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only customers can create job posts",
      });
    }

    const { title, description, duration, service_id, location } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Job title is required",
        errors: [{ field: "title", message: "Job title is required" }],
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Job description is required",
        errors: [
          { field: "description", message: "Job description is required" },
        ],
      });
    }

    if (!duration) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Duration is required",
        errors: [{ field: "duration", message: "Duration is required" }],
      });
    }

    if (!service_id) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Service is required",
        errors: [{ field: "service_id", message: "Service is required" }],
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

    // Verify customer exists
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Customer not found",
      });
    }

    const jobPost = new JobPost({
      title,
      description,
      duration,
      service_id,
      location,
      posted_by: req.user.id,
      status: "Pending", // Always starts as pending
    });

    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("posted_by", "name email");

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Job post created successfully. Waiting for admin approval.",
      data: {
        jobPost: populatedJobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/job-posts/:id - Update job post
 * - Customer can update their own pending posts
 * - Admin can update any post
 */
export const updateJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, duration, service_id, location } = req.body;

    const jobPost = await JobPost.findById(id);

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Job post not found",
      });
    }

    // Access control
    if (req.user.role !== "admin") {
      if (req.user.role !== "customer") {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "Only customers and admins can update job posts",
        });
      }

      // Customer can only update their own pending posts
      if (jobPost.posted_by.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only update your own job posts",
        });
      }

      if (jobPost.status !== "Pending") {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only update pending job posts",
        });
      }
    }

    // Update fields
    if (title) jobPost.title = title;
    if (description) jobPost.description = description;
    if (duration) jobPost.duration = duration;
    if (location !== undefined) jobPost.location = location;

    // Verify service if being updated
    if (service_id) {
      const service = await Service.findById(service_id);
      if (!service) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Service not found",
        });
      }
      jobPost.service_id = service_id;
    }

    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("posted_by", "name email")
      .populate("applied_providers", "name email skills");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Job post updated successfully",
      data: {
        jobPost: populatedJobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/job-posts/:id/approve - Approve job post (admin only)
 */
export const approveJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobPost = await JobPost.findById(id);

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Job post not found",
      });
    }

    if (jobPost.status === "Approved") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Job post is already approved",
      });
    }

    jobPost.status = "Approved";
    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("posted_by", "name email");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Job post approved successfully. Providers can now view this job.",
      data: {
        jobPost: populatedJobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/job-posts/:id/reject - Reject job post (admin only)
 */
export const rejectJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobPost = await JobPost.findById(id);

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Job post not found",
      });
    }

    if (jobPost.status === "Rejected") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Job post is already rejected",
      });
    }

    jobPost.status = "Rejected";
    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("posted_by", "name email");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Job post rejected successfully",
      data: {
        jobPost: populatedJobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/job-posts/:id/apply - Apply to job post (provider only)
 */
export const applyToJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== "provider") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only providers can apply to job posts",
      });
    }

    const jobPost = await JobPost.findById(id);

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Job post not found",
      });
    }

    if (jobPost.status !== "Approved") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "You can only apply to approved job posts",
      });
    }

    // Check if provider already applied
    if (jobPost.applied_providers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "You have already applied to this job post",
      });
    }

    // Add provider to applied list
    jobPost.applied_providers.push(req.user.id);
    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("posted_by", "name email")
      .populate("applied_providers", "name email skills phone");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Successfully applied to job post",
      data: {
        jobPost: populatedJobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/job-posts/:id - Delete job post (admin only)
 */
export const deleteJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobPost = await JobPost.findByIdAndDelete(id);

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Job post not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Job post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
