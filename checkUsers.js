import mongoose from "mongoose";
import User from "./src/models/Auth.js";
import Provider from "./src/models/Provider.js";
import Customer from "./src/models/Customer.js";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Check users in database
const checkUsers = async () => {
  try {
    console.log("\n=== CHECKING DATABASE USERS ===\n");

    // Check admins
    const admins = await User.find({ role: "admin" }).select("-password");
    console.log(`Admins found: ${admins.length}`);
    admins.forEach((admin, index) => {
      console.log(`  ${index + 1}. Email: ${admin.email}, Name: ${admin.name}`);
    });

    // Check providers
    const providers = await Provider.find({}).select("-password");
    console.log(`\nProviders found: ${providers.length}`);
    providers.forEach((provider, index) => {
      console.log(
        `  ${index + 1}. Email: ${provider.email}, Name: ${
          provider.name
        }, Approved: ${provider.isApproved}`
      );
    });

    // Check customers
    const customers = await Customer.find({}).select("-password");
    console.log(`\nCustomers found: ${customers.length}`);
    customers.forEach((customer, index) => {
      console.log(
        `  ${index + 1}. Email: ${customer.email}, Name: ${customer.name}`
      );
    });

    console.log("\n=== END OF DATABASE CHECK ===\n");
  } catch (error) {
    console.error("Error checking users:", error);
  }
};

// Test login credentials
const testLogin = async (email, password, role) => {
  try {
    console.log(`\n=== TESTING LOGIN ===`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);

    let user = null;

    // Find user based on role
    if (role === "admin") {
      user = await User.findOne({ email, role: "admin" }).select("+password");
    } else if (role === "provider") {
      user = await Provider.findOne({ email }).select("+password");
    } else if (role === "customer") {
      user = await Customer.findOne({ email }).select("+password");
    }

    if (!user) {
      console.log("User not found in database");
      return;
    }

    console.log("User found");
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);

    if (role === "provider") {
      console.log(`   Approved: ${user.isApproved}`);
    }

    // Test password
    const isPasswordValid = await user.comparePassword(password);
    if (isPasswordValid) {
      console.log("Password is correct");
    } else {
      console.log("Password is incorrect");
    }

    console.log("=== END OF LOGIN TEST ===\n");
  } catch (error) {
    console.error("Error testing login:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();

  // Check all users
  await checkUsers();

  // Example: Test specific credentials (uncomment and modify as needed)
  // await testLogin("admin@workbond.com", "admin123", "admin");
  // await testLogin("provider@example.com", "password123", "provider");
  // await testLogin("customer@example.com", "password123", "customer");

  // Close connection
  await mongoose.connection.close();
  console.log("Database connection closed");
};

main();
