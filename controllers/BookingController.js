import Booking from "../models/Booking.js";

// Get all booking
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();

    res.status(200).json({
      length: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

// Get a booking by Id
export const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById({ _id: bookingId });

    if (!booking) return res.status(404).json({ Message: "Booking not found" });

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

// Create a booking
export const createBooking = async (req, res) => {
  try {
    const newBooking = new Booking(req.body);

    const savedBooking = await newBooking.save();
    res.status(200).json({
      Message: "booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

// Update a booking by Id
export const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const bookingExist = await Booking.findById(bookingId);
    if (!bookingExist)
      return res.status(404).json({ Error: "booking not found" });

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json({
      Message: "booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};

// Delete a booking by Id
export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) return res.status(404).json({ Message: "booking not found" });
    res.status(200).json({
      Message: "booking removed successfully",
      deletedBooking: booking,
    });
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
};
