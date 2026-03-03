const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const dbUrl = process.env.DB_URL;

  if (!dbUrl) {
    console.error(" DB_URL is not defined in .env");
    process.exit(1);
  }

  console.log(" Connecting to MongoDB:", dbUrl);

  try {
    await mongoose.connect(dbUrl);
    console.log(" MongoDB connected successfully");

    const collection = mongoose.connection.db.collection("users");
    const indexes = await collection.indexes();

    const oldIndex = indexes.find(i => i.name === "referralCode_1");

    if (oldIndex) {
      await collection.dropIndex("referralCode_1");
      console.log("🧹 Removed old referralCode_1 index");
    } else {
      console.log("ℹ referralCode_1 index not found (OK)");
    }

  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log(" Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
