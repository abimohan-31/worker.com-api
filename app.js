import express from "express";
import connectDB from "./src/config/db.js";
import cors from "cors";
import { defaultError, notFound } from "./src/middleware/ErrorHandlers.js";

// Import route groups
import usersRouter from "./src/routes/usersRoutes.js";
import adminsRouter from "./src/routes/adminsRoutes.js";
import customersRouter from "./src/routes/customersRoutes.js";
import providersRouter from "./src/routes/providersRoutes.js";
import subscriptionsRouter from "./src/routes/subscriptionsRoutes.js";
import reviewsRouter from "./src/routes/reviewsRoutes.js";
import servicesRouter from "./src/routes/servicesRoutes.js";

// Initialize express
const app = express();
app.use(express.json());
app.use(cors());

// Test if the server is working or not
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Clumsy to Clean API",
  });
});

// Connect MongoDB
connectDB();

// API Routes
app.use("/api/users", usersRouter);
app.use("/api/admins", adminsRouter);
app.use("/api/customers", customersRouter);
app.use("/api/providers", providersRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/services", servicesRouter);

// Page not found
app.use(notFound);

// Error Handlers
app.use(defaultError);

// Connect Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
