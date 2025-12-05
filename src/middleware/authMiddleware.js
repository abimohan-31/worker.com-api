import jwt from "jsonwebtoken";
import Provider from "../models/Provider.js";
import Customer from "../models/Customer.js";
import User from "../models/Auth.js";
import TokenBlacklist from "../models/TokenBlacklist.js";

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
  try {
    // Try to get token from cookie first (preferred method)
    let token = req.cookies?.access_token;
    
    // Fallback to Authorization header if no cookie
    if (!token) {
      token = req.header("Authorization")?.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Access denied. No token provided.",
      });
    }

    // Check if token is blacklisted (logged out)
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Token has been invalidated. Please log in again.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Find user based on role
    let user = null;
    if (decoded.role === "provider") {
      user = await Provider.findById(decoded.id);
    } else if (decoded.role === "customer") {
      user = await Customer.findById(decoded.id);
    } else if (decoded.role === "admin") {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid token. User not found.",
      });
    }

    // Attach user details to request
    req.user = {
      id: user._id.toString(),
      role: decoded.role,
      email: user.email,
      name: user.name,
    };

    // For providers, also attach approval status
    if (decoded.role === "provider") {
      req.user.isApproved = user.isApproved;
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      // Clear the expired cookie
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });
      
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Token expired. Please log in again.",
        expired: true, // Flag for frontend to handle logout
      });
    }
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Authentication error.",
    });
  }
};

// Optional token verification - doesn't fail if no token, but sets req.user if token is valid
// Useful for public routes that need to check if user is admin for enhanced features
export const optionalVerifyToken = async (req, res, next) => {
  try {
    // Try to get token from cookie first (preferred method)
    let token = req.cookies?.access_token;
    
    // Fallback to Authorization header if no cookie
    if (!token) {
      token = req.header("Authorization")?.replace("Bearer ", "");
    }

    // If no token, continue without setting req.user (public access)
    if (!token) {
      return next();
    }

    // Check if token is blacklisted (logged out)
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      // Token is blacklisted, continue as public user
      return next();
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Find user based on role
    let user = null;
    if (decoded.role === "provider") {
      user = await Provider.findById(decoded.id);
    } else if (decoded.role === "customer") {
      user = await Customer.findById(decoded.id);
    } else if (decoded.role === "admin") {
      user = await User.findById(decoded.id);
    }

    if (user) {
      // Attach user details to request
      req.user = {
        id: user._id.toString(),
        role: decoded.role,
        email: user.email,
        name: user.name,
      };

      // For providers, also attach approval status
      if (decoded.role === "provider") {
        req.user.isApproved = user.isApproved;
      }
    }

    next();
  } catch (error) {
    // If token verification fails, continue as public user (don't fail the request)
    // This allows public routes to work even with invalid/expired tokens
    next();
  }
};

// Role-based authorization middleware (accepts single role or array of roles)
export const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Authentication required.",
      });
    }

    // Flatten array if nested arrays are passed
    const roles = allowedRoles.flat();

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: `Access denied. Required role: ${roles.join(
          " or "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Provider approval middleware (checks if provider is approved)
export const verifyProviderApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== "provider") {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "This route is only accessible to providers.",
    });
  }

  if (!req.user.isApproved) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Access denied. Your provider account is pending approval.",
    });
  }

  next();
};
