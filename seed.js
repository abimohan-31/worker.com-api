import mongoose from "mongoose";
import dotenv from "dotenv";

// Import models
import User from "./models/User.js";
import Provider from "./models/Provider.js";
import Customer from "./models/Customer.js";
// Removed: Booking, Review, Item modules in new architecture

// Load environment variables
dotenv.config();

// Check if running in development
if (process.env.NODE_ENV === "production") {
  console.error("❌ Seeding is not allowed in production environment!");
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Clear all collections
const clearCollections = async () => {
  try {
    console.log("\n🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Provider.deleteMany({});
    await Customer.deleteMany({});
    // Removed collections (bookings, reviews, items)
    console.log("✅ Collections cleared successfully!");
  } catch (error) {
    console.error("❌ Error clearing collections:", error);
    throw error;
  }
};

// Seed Admin
const seedAdmin = async () => {
  try {
    console.log("\n👤 Seeding Admin...");

    const admin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123", // Will be hashed by pre-save hook
      role: "admin",
    });

    await admin.save();
    console.log(`✅ Admin created: ${admin.email} (password: admin123)`);
    return admin;
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    throw error;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log("\n🌱 Starting database seeding process...\n");
    console.log("Environment: ", process.env.NODE_ENV || "development");

    // Connect to database
    await connectDB();

    // Clear existing data
    await clearCollections();

    // Seed data
    const admin = await seedAdmin();
    const providers = await seedProviders();
    const customers = await seedCustomers();

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Seeding Summary:");
    console.log("=".repeat(50));
    console.log(`👤 Admin: 1`);
    console.log(`👷 Providers: ${providers.length}`);
    console.log(`👥 Customers: ${customers.length}`);
    console.log("=".repeat(50));
    console.log("\n✅ Database seeded successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("   Admin: admin@example.com / admin123");
    console.log("   Provider: john.smith@example.com / provider123");
    console.log("   Customer: alice.anderson@example.com / customer123");
    console.log("\n");

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
