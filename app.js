import express from "express";
import connectDB from "./config/db.js";
import userRouter from "./routes/AuthRoutes.js";
import providerRouter from "./routes/ProviderRoutes.js";
import serviceRouter from "./routes/ServiceRoutes.js";
import bookingRouter from "./routes/BookingRoutes.js";

// Initialized express
const app = express();
app.use(express.json());

// Test if the server is working or not.
app.get("/", (req, res) => {
  res.send("Welcome to Mini pos API");
});

//Connect MongoDB
connectDB();

//Routes
app.use("/c2c/users/", userRouter);
app.use("/c2c/providers/", providerRouter);
app.use("/c2c/services/", serviceRouter);
app.use("/c2c/bookings/", bookingRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
