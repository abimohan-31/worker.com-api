import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config(process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose
      .connect("mongodb://127.0.0.1:27017/clumpsy-to-clean")
      .then(() => console.log("Connected!"));
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

export default connectDB;
