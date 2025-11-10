import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Provider from "../models/Provider.js";
import Customer from "../models/Customer.js";

const signToken = (id, role) => {
	return jwt.sign({ id, role }, process.env.JWT_SECRET || "your-secret-key", {
		expiresIn: "30d",
	});
};

// POST /api/users/register  (role: provider | customer)
export const register = async (req, res, next) => {
	try {
		const { role, name, email, password, phone, address, experience_years, skills } = req.body || {};

		if (!role || !["provider", "customer"].includes(role)) {
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Invalid or missing role. Allowed: provider, customer",
				errors: [{ field: "role", message: "role must be provider or customer" }],
			});
		}
		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Missing required fields",
				errors: [
					{ field: "name", message: "name is required" },
					{ field: "email", message: "email is required" },
					{ field: "password", message: "password is required" },
				],
			});
		}

		if (role === "customer") {
			if (!phone || !address) {
				return res.status(400).json({
					success: false,
					statusCode: 400,
					message: "Missing required fields for customer",
					errors: [
						{ field: "phone", message: "phone is required" },
						{ field: "address", message: "address is required" },
					],
				});
			}
			const exists = await Customer.findOne({ email });
			if (exists) {
				return res.status(400).json({
					success: false,
					statusCode: 400,
					message: "Customer with this email already exists",
				});
			}
			const customer = new Customer({ name, email, password, phone, address, role: "customer" });
			await customer.save();
			const dto = customer.toObject();
			delete dto.password;
			return res.status(201).json({
				success: true,
				statusCode: 201,
				message: "Customer registered successfully",
				data: { user: dto, token: signToken(customer._id, "customer") },
			});
		}

		// provider
		if (!phone || !address || !experience_years || !skills) {
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Missing required fields for provider",
				errors: [
					{ field: "phone", message: "phone is required" },
					{ field: "address", message: "address is required" },
					{ field: "experience_years", message: "experience_years is required" },
					{ field: "skills", message: "skills is required" },
				],
			});
		}
		const providerExists = await Provider.findOne({ email });
		if (providerExists) {
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Provider with this email already exists",
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
		const pDto = provider.toObject();
		delete pDto.password;
		return res.status(201).json({
			success: true,
			statusCode: 201,
			message:
				"Provider registered successfully. Your account is pending admin approval. You will be able to log in and access provider features once approved.",
			data: {
				user: pDto,
				isApproved: false,
			},
		});
	} catch (err) {
		if (err.code === 11000) {
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Duplicate key error",
				errors: [{ field: Object.keys(err.keyPattern)[0], message: "already exists" }],
			});
		}
		next(err);
	}
};

// POST /api/users/login  (role: admin|provider|customer)
export const login = async (req, res, next) => {
	try {
		const { email, password, role } = req.body || {};
		if (!email || !password || !role) {
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Email, password, and role are required",
				errors: [
					{ field: "email", message: "email is required" },
					{ field: "password", message: "password is required" },
					{ field: "role", message: "role is required" },
				],
			});
		}
		let user = null;
		if (role === "admin") user = await User.findOne({ email, role: "admin" }).select("+password");
		else if (role === "provider") user = await Provider.findOne({ email }).select("+password");
		else if (role === "customer") user = await Customer.findOne({ email }).select("+password");
		else
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Invalid role",
			});

		if (!user) {
			return res.status(401).json({
				success: false,
				statusCode: 401,
				message: "Invalid email or password",
			});
		}
		const ok = await user.comparePassword(password);
		if (!ok) {
			return res.status(401).json({
				success: false,
				statusCode: 401,
				message: "Invalid email or password",
			});
		}
		if (role === "provider" && !user.isApproved) {
			return res.status(403).json({
				success: false,
				statusCode: 403,
				message:
					"Access denied. Your provider account is pending admin approval. Please contact an administrator or wait for approval.",
			});
		}
		const dto = user.toObject();
		delete dto.password;
		return res.status(200).json({
			success: true,
			statusCode: 200,
			message: "Login successful",
			data: { user: dto, token: signToken(user._id, role) },
		});
	} catch (err) {
		next(err);
	}
};

// POST /api/users/create (admin only)
export const createUser = async (req, res, next) => {
	try {
		const { role, name, email, password, phone, address } = req.body || {};
		if (!role || !["admin", "provider", "customer"].includes(role)) {
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Invalid or missing role",
			});
		}
		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				statusCode: 400,
				message: "Missing required fields",
			});
		}
		if (role === "admin") {
			const exists = await User.findOne({ email, role: "admin" });
			if (exists) {
				return res.status(400).json({
					success: false,
					statusCode: 400,
					message: "Admin with this email already exists",
				});
			}
			const admin = new User({ name, email, password, role: "admin" });
			await admin.save();
			const dto = admin.toObject();
			delete dto.password;
			return res.status(201).json({
				success: true,
				statusCode: 201,
				message: "Admin created successfully",
				data: { user: dto },
			});
		}
		// delegate to register flow for provider/customer creation by admin
		req.body = { role, name, email, password, phone, address };
		return register(req, res, next);
	} catch (err) {
		next(err);
	}
};

// GET/PUT/DELETE /api/users/:id
export const getUserById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const role = req.query.role; // optional hint
		let user = null;
		if (role === "admin") user = await User.findById(id).select("-password");
		else if (role === "provider") user = await Provider.findById(id).select("-password");
		else if (role === "customer") user = await Customer.findById(id).select("-password");
		else {
			// try all
			user =
				(await Provider.findById(id).select("-password")) ||
				(await Customer.findById(id).select("-password")) ||
				(await User.findById(id).select("-password"));
		}
		if (!user) {
			return res.status(404).json({ success: false, statusCode: 404, message: "User not found" });
		}
		return res.status(200).json({ success: true, statusCode: 200, data: { user } });
	} catch (err) {
		next(err);
	}
};

export const updateUser = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { role } = req.body || {};
		let Model = role === "admin" ? User : role === "provider" ? Provider : Customer;
		if (!Model) {
			return res.status(400).json({ success: false, statusCode: 400, message: "role is required" });
		}
		const user = await Model.findById(id);
		if (!user) return res.status(404).json({ success: false, statusCode: 404, message: "User not found" });
		Object.assign(user, req.body);
		await user.save();
		const dto = user.toObject();
		delete dto.password;
		return res
			.status(200)
			.json({ success: true, statusCode: 200, message: "User updated successfully", data: { user: dto } });
	} catch (err) {
		next(err);
	}
};

export const deleteUser = async (req, res, next) => {
	try {
		const { id } = req.params;
		const role = req.query.role;
		let result = null;
		if (role === "admin") result = await User.findByIdAndDelete(id);
		else if (role === "provider") result = await Provider.findByIdAndDelete(id);
		else if (role === "customer") result = await Customer.findByIdAndDelete(id);
		else {
			result =
				(await Provider.findByIdAndDelete(id)) ||
				(await Customer.findByIdAndDelete(id)) ||
				(await User.findByIdAndDelete(id));
		}
		if (!result) return res.status(404).json({ success: false, statusCode: 404, message: "User not found" });
		return res.status(200).json({ success: true, statusCode: 200, message: "User deleted successfully" });
	} catch (err) {
		next(err);
	}
};


