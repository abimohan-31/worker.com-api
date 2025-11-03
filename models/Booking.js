import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Customer ID is required"],
  },
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: [true, "Provider ID is required"],
  },
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: [true, "Service ID is required"],
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
});

export default mongoose.model("Booking", bookingSchema);
