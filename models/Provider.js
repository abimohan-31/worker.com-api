import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      maxlength: [15, "Password cannot exceed 15 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone number must be 10 digits"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    experience_years: {
      type: Number,
      required: [true, "Experience years are required"],
      min: [1, "Minimum 1 year of experience is required"],
    },
    skills: {
      type: [String],
      required: [true, "At least one skill is required"],
    },
    availability_status: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Provider", providerSchema);
