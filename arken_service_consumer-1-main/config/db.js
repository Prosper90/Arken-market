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

    const oldReferralIndex = indexes.find(i => i.name === "referralCode_1");
    if (oldReferralIndex) {
      await collection.dropIndex("referralCode_1");
      console.log("🧹 Removed old referralCode_1 index");
    }

    // Ensure uniqueId_1 is always sparse — drop and recreate if it isn't
    const uniqueIdIndex = indexes.find(i => i.name === "uniqueId_1");
    if (uniqueIdIndex && !uniqueIdIndex.sparse) {
      await collection.dropIndex("uniqueId_1");
      console.log("🧹 Dropped non-sparse uniqueId_1 index");
    }
    if (!uniqueIdIndex || !uniqueIdIndex.sparse) {
      await collection.createIndex(
        { uniqueId: 1 },
        { unique: true, sparse: true, name: "uniqueId_1" }
      );
      console.log("✅ Created sparse uniqueId_1 index");
    }

  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.log(" Retrying MongoDB connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
