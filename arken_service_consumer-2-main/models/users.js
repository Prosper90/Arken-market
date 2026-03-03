const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    username: {
      type: String,
      default: null
    },
    firstName: {
      type: String,
      default: null
    },
    walletAddress: {
      type: String,
      default: null
    },
    
      initData: {
      type: String,
      default: null
    },
    walletVerified: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["STARTED", "WALLET_CONNECTED"],
      default: "STARTED"
    },

    winRate: {
      type: Number,
      default: 0 
    },
    totalPredictions: {
      type: Number,
      default: 0
    },
    totalWins: {
      type: Number,
      default: 0
    },
    totalLosses: {
      type: Number,
      default: 0
    },

    // Referral system
    referredBy: {
      type: Number,
      default: null,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    referralEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
