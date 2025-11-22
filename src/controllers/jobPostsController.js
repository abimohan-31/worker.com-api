import JobPost from "../models/JobPost.js";
import Service from "../models/Service.js";
import Customer from "../models/Customer.js";
import Provider from "../models/Provider.js";
import { queryHelper } from "../utils/queryHelper.js";

/**
 * GET /api/job-posts - Get all job posts
 * - Providers: See all job posts (immediately active, no approval needed)
 * - Customers: See their own posts
 * - Admin: See all posts
 * - Public: Cannot access (handled by route middleware)
 */
export const getAllJobPosts = async (req, res, next) => {
  try {
    let defaultFilters = {};

    // Role-based filtering
    if (req.user.role === "customer") {
      // Customers can only see their own posts
      defaultFilters.customerId = req.user.id;
    }
    // Providers and Admin see all (no default filter)

    const { data, pagination } = await queryHelper(
      JobPost,
      req.query,
      ["title", "description", "location", "duration"], // Search fields
      {
        defaultFilters,
        populate: [
          { path: "service_id", select: "name category description" },
          { path: "customerId", select: "name email phone" },
          {
            path: "applications.providerId",
            select: "name email skills phone",
          },
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
      .populate("customerId", "name email phone address")
      .populate("applications.providerId", "name email skills phone");

    if (!jobPost) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Job post not found",
      });
    }

    // Access control
    if (req.user.role === "customer") {
      // Customer can only see their own posts
      if (jobPost.customerId._id.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only view your own job posts",
        });
      }
    }
    // Providers and Admin can see all job posts

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
 * Job posts are immediately active - no admin approval needed
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

    // Verify customer exists and has phone number
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Customer not found",
      });
    }

    if (!customer.phone) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message:
          "Phone number is required to post jobs. Please update your profile.",
        errors: [{ field: "phone", message: "Phone number is required" }],
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

    const jobPost = new JobPost({
      title,
      description,
      duration,
      service_id,
      location,
      customerId: req.user.id,
      applications: [], // Initialize empty applications array
    });

    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("customerId", "name email phone");

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Job post created successfully. It is now visible to providers.",
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
 * - Customer can update their own posts
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

      // Customer can only update their own posts
      if (jobPost.customerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only update your own job posts",
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
      .populate("customerId", "name email phone")
      .populate("applications.providerId", "name email skills");

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

    // Check if provider already applied
    const existingApplication = jobPost.applications.find(
      (app) => app.providerId.toString() === req.user.id
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "You have already applied to this job post",
      });
    }

    // Add new application
    jobPost.applications.push({
      providerId: req.user.id,
      status: "applied",
      appliedAt: new Date(),
    });

    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("customerId", "name email phone")
      .populate("applications.providerId", "name email skills phone");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        "Successfully applied to job post. Waiting for customer approval.",
      data: {
        jobPost: populatedJobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/job-posts/:id/applications/:applicationId/approve - Approve provider application (customer only)
 */
export const approveApplication = async (req, res, next) => {
  try {
    const { id, applicationId } = req.params;

    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only customers can approve applications",
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

    // Verify customer owns this job post
    if (jobPost.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only approve applications for your own job posts",
      });
    }

    // Find the application
    const application = jobPost.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Application not found",
      });
    }

    if (application.status === "approved") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Application is already approved",
      });
    }

    // Update application status
    application.status = "approved";
    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("customerId", "name email phone")
      .populate("applications.providerId", "name email skills phone");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Application approved successfully",
      data: {
        jobPost: populatedJobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/job-posts/:id/applications/:applicationId/reject - Reject provider application (customer only)
 */
export const rejectApplication = async (req, res, next) => {
  try {
    const { id, applicationId } = req.params;

    if (!req.user || req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Only customers can reject applications",
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

    // Verify customer owns this job post
    if (jobPost.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only reject applications for your own job posts",
      });
    }

    // Find the application
    const application = jobPost.applications.id(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Application not found",
      });
    }

    if (application.status === "rejected") {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Application is already rejected",
      });
    }

    // Update application status
    application.status = "rejected";
    await jobPost.save();

    const populatedJobPost = await JobPost.findById(jobPost._id)
      .populate("service_id", "name category description")
      .populate("customerId", "name email phone")
      .populate("applications.providerId", "name email skills phone");

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Application rejected successfully",
      data: {
        jobPost: populatedJobPost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/job-posts/:id - Delete job post
 * - Customer can delete their own posts
 * - Admin can delete any post
 */
export const deleteJobPost = async (req, res, next) => {
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

    // Access control
    if (req.user.role !== "admin") {
      if (req.user.role !== "customer") {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "Only customers and admins can delete job posts",
        });
      }

      // Customer can only delete their own posts
      if (jobPost.customerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: "You can only delete your own job posts",
        });
      }
    }

    await JobPost.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Job post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
