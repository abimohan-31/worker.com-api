import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
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
      unique: true,
    },

    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
