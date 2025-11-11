import mongoose from "mongoose";
import Customer from "./Customer.js";
import Provider from "./Provider.js";

const reviewSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Customer,
      required: [true, "Customer ID is required"],
    },
    provider_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Provider,
      required: [true, "Provider ID is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
    review_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Review", reviewSchema);
