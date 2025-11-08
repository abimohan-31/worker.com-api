import mongoose from "mongoose";
import Provider from "./Provider.js";

const subscriptionSchema = new mongoose.Schema(
  {
    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Provider,
      required: [true, "Provider ID is required"],
    },
    plan_name: {
      type: String,
      required: [true, "Plan name is required"],
      enum: ["Free", "Standard", "Premium"],
      default: "Free",
      trim: true,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
      required: [true, "End date is required"],
    },
    renewal_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },
    amount: {
      type: Number,
      required: [true, "Subscription amount is required"],
      min: [0, "Amount cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// 🔁 Automatically mark expired subscriptions
subscriptionSchema.pre("save", function (next) {
  if (this.end_date < new Date() && this.status === "Active") {
    this.status = "Expired";
  }
  next();
});

// ⚡ Index for faster lookups by provider
subscriptionSchema.index({ provider_id: 1 });

export default mongoose.model("Subscription", subscriptionSchema);
