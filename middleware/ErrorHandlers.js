// Centralized error handling middleware with standardized structure

// Not found middleware
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Not Found - ${req.originalUrl}`,
  });
};

// Default error handler
export const defaultError = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Internal Server Error";
  let errors = undefined;

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0];
    message = "Duplicate key error";
    errors = [{ field, message: "already exists" }];
  }

  // Handle MongoDB validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle MongoDB cast errors (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
