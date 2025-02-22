import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const db = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL is not defined in the environment variables");
    }

    await mongoose.connect(mongoUrl);
    console.log("Database is connected successfully");
  } catch (err) {
    console.log("Problem in connecting with database");
    console.log(err);
  }
};
export default db;
