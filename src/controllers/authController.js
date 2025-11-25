import jwt from "jsonwebtoken";
import User from "../models/Auth.js";
import Provider from "../models/Provider.js";
import Customer from "../models/Customer.js";
import TokenBlacklist from "../models/TokenBlacklist.js";

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

// POST /api/users/register - Register provider or customer
export const register = async (req, res, next) => {
  try {
    const {
      role,
      name,
      email,
      password,
      phone,
      address,
      experience_years,
      skills,
    } = req.body;

    // Validate role
    if (!role || !["provider", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid role. Role must be 'provider' or 'customer'",
        errors: [
          { field: "role", message: "Role must be provider or customer" },
        ],
      });
    }

    // Validate common fields
    if (!name) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name is required",
        errors: [{ field: "name", message: "Name is required" }],
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Email is required",
        errors: [{ field: "email", message: "Email is required" }],
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Password is required",
        errors: [{ field: "password", message: "Password is required" }],
      });
    }

    // Handle customer registration
    if (role === "customer") {
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Entry with this email already exists",
        });
      }

      const customer = new Customer({
        name,
        email,
        phone,
        password,
        role: "customer",
      });

      await customer.save();

      const customerData = customer.toObject();
      delete customerData.password;

      const token = generateToken(customer._id, "customer");

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: "You registered successfully",
        data: {
          user: customerData,
          token,
        },
      });
    }

    // Handle provider registration
    if (role === "provider") {
      if (!phone) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Phone is required for providers",
          errors: [{ field: "phone", message: "Phone is required" }],
        });
      }

      if (!address) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Address is required for providers",
          errors: [{ field: "address", message: "Address is required" }],
        });
      }

      if (!experience_years) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Experience years is required for providers",
          errors: [
            {
              field: "experience_years",
              message: "Experience years is required",
            },
          ],
        });
      }

      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Skills are required for providers",
          errors: [
            { field: "skills", message: "At least one skill is required" },
          ],
        });
      }

      const existingProvider = await Provider.findOne({ email });
      if (existingProvider) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Entry with this email already exists",
        });
      }

      const provider = new Provider({
        name,
        email,
        password,
        phone,
        address,
        experience_years,
        skills,
        role: "provider",
        isApproved: false,
      });

      await provider.save();

      const providerData = provider.toObject();
      delete providerData.password;

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message:
          "You registered successfully. Your account is pending admin approval.",
        data: {
          user: providerData,
          isApproved: false,
        },
      });
    }
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

// POST /api/users/login - Login for all roles
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    console.log("=== LOGIN ATTEMPT ===");
    console.log("Email:", email);
    console.log("Role:", role);
    console.log("Password provided:", password ? "Yes" : "No");

    if (!email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Email is required",
        errors: [{ field: "email", message: "Email is required" }],
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Password is required",
        errors: [{ field: "password", message: "Password is required" }],
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Role is required",
        errors: [{ field: "role", message: "Role is required" }],
      });
    }

    let user = null;

    // Find user based on role
    if (role === "admin") {
      console.log("Looking for admin user...");
      user = await User.findOne({ email, role: "admin" }).select("+password");
    } else if (role === "provider") {
      console.log("Looking for provider user...");
      user = await Provider.findOne({ email }).select("+password");
    } else if (role === "customer") {
      console.log("Looking for customer user...");
      user = await Customer.findOne({ email }).select("+password");
    } else {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message:
          "Invalid role. Role must be 'admin', 'provider', or 'customer'",
        errors: [{ field: "role", message: "Invalid role" }],
      });
    }

    console.log("User found:", user ? "Yes" : "No");
    if (user) {
      console.log("User ID:", user._id);
      console.log("User email:", user.email);
      console.log("User has password field:", user.password ? "Yes" : "No");
      if (role === "provider") {
        console.log("Provider isApproved:", user.isApproved);
      }
    }

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid email or password",
      });
    }

    // Verify password
    console.log("Verifying password...");
    const isPasswordValid = await user.comparePassword(password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("Password verification failed");
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid email or password",
      });
    }

    // Check provider approval
    if (role === "provider" && !user.isApproved) {
      console.log("Provider not approved");
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message:
          "Access denied. Your provider account is pending admin approval.",
        isApproved: false,
      });
    }

    // Generate token
    const token = generateToken(user._id, role);
    console.log("Login successful, token generated");

    // Remove password from response
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

// POST /api/users/logout - Logout and invalidate token
export const logout = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Token is required",
      });
    }

    // Decode token to get expiration
    let decoded;
    try {
      decoded = jwt.decode(token);
    } catch (error) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid token",
      });
    }

    if (!decoded || !decoded.exp) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid token format",
      });
    }

    // Calculate expiration date
    const expiresAt = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await TokenBlacklist.create({
      token,
      expiresAt,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Logged out successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      // Token already blacklisted
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Already logged out",
      });
    }
    next(error);
  }
};

// GET /api/users/:id - Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.query;

    let user = null;

    if (role === "admin") {
      user = await User.findById(id).select("-password");
    } else if (role === "provider") {
      user = await Provider.findById(id).select("-password");
    } else if (role === "customer") {
      user = await Customer.findById(id).select("-password");
    } else {
      // Try all models
      user =
        (await Provider.findById(id).select("-password")) ||
        (await Customer.findById(id).select("-password")) ||
        (await User.findById(id).select("-password"));
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id - Update user
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "You can only update your own profile",
      });
    }

    let user = null;
    let Model = null;

    if (role === "admin") {
      Model = User;
    } else if (role === "provider") {
      Model = Provider;
    } else if (role === "customer") {
      Model = Customer;
    } else {
      // Try to find user in all models
      user =
        (await Provider.findById(id)) ||
        (await Customer.findById(id)) ||
        (await User.findById(id));

      if (!user) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: "User not found",
        });
      }

      // Update user
      Object.keys(req.body).forEach((key) => {
        if (key !== "password" && key !== "role" && key !== "_id") {
          user[key] = req.body[key];
        }
      });

      await user.save();

      const userData = user.toObject();
      delete userData.password;

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User updated successfully",
        data: {
          user: userData,
        },
      });
    }

    if (!Model) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Role is required",
        errors: [{ field: "role", message: "Role is required" }],
      });
    }

    user = await Model.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    // Update user
    Object.keys(req.body).forEach((key) => {
      if (key !== "password" && key !== "role" && key !== "_id") {
        user[key] = req.body[key];
      }
    });

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User updated successfully",
      data: {
        user: userData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id - Delete user (admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.query;

    let result = null;

    if (role === "admin") {
      result = await User.findByIdAndDelete(id);
    } else if (role === "provider") {
      result = await Provider.findByIdAndDelete(id);
    } else if (role === "customer") {
      result = await Customer.findByIdAndDelete(id);
    } else {
      // Try all models
      result =
        (await Provider.findByIdAndDelete(id)) ||
        (await Customer.findByIdAndDelete(id)) ||
        (await User.findByIdAndDelete(id));
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/create - Create user (admin only)
export const createUser = async (req, res, next) => {
  try {
    const {
      role,
      name,
      email,
      password,
      phone,
      address,
      experience_years,
      skills,
    } = req.body;

    if (!role || !["admin", "provider", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message:
          "Invalid role. Role must be 'admin', 'provider', or 'customer'",
        errors: [{ field: "role", message: "Invalid role" }],
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name is required",
        errors: [{ field: "name", message: "Name is required" }],
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Email is required",
        errors: [{ field: "email", message: "Email is required" }],
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Password is required",
        errors: [{ field: "password", message: "Password is required" }],
      });
    }

    // Handle admin creation
    if (role === "admin") {
      const existingAdmin = await User.findOne({ email, role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Admin with this email already exists",
        });
      }

      const admin = new User({
        name,
        email,
        password,
        role: "admin",
      });

      await admin.save();

      const adminData = admin.toObject();
      delete adminData.password;

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: "Admin created successfully",
        data: {
          user: adminData,
        },
      });
    }

    // Handle provider/customer creation (reuse register logic)
    req.body.role = role;
    return register(req, res, next);
  } catch (error) {
    next(error);
  }
};
