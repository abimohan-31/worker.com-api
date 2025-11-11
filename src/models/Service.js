import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      enum: [
        "Cleaning",
        "Plumbing",
        "Electrical",
        "Painting",
        "Carpentry",
        "Gardening",
        "Moving",
        "Handyman",
        "Other",
      ],
      trim: true,
    },
    base_price: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Base price cannot be negative"],
    },
    unit: {
      type: String,
      enum: ["hour", "day", "project", "item", "1 square feet"],
      default: "hour",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    icon: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
serviceSchema.index({ category: 1 });
serviceSchema.index({ name: 1 });
serviceSchema.index({ isActive: 1 });

export default mongoose.model("Service", serviceSchema);

