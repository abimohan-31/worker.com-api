import mongoose from "mongoose";
import Customer from "./Customer.js";
import Provider from "./Provider.js";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Customer,
      required: [true, "Customer ID is required"],
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Provider,
      required: [true, "Provider ID is required"],
    },

    booking_date: {
      type: Date,
      default: Date.now,
    },
    scheduled_date: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    total_amount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Amount cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Booking", bookingSchema);
