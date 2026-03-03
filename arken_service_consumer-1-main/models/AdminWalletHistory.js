const mongoose = require("mongoose");

const adminWalletHistorySchema = new mongoose.Schema(
  {
    adminWalletId: {
      type: mongoose.Types.ObjectId,
      ref: "adminWallet",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    predictionId: {
      type: mongoose.Types.ObjectId,
      ref: "Prediction",
      required: true,
      index: true,
    },

    currencySymbol: {
      type: String,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    feePercentage: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["PLATFORM_FEE", "REFERRAL_FEE", "CREATOR_FEE", "GROUP_COMMISSION"],
      default: "PLATFORM_FEE",
      index: true,
    },

    // For REFERRAL_FEE / CREATOR_FEE / GROUP_COMMISSION: who received it
    recipientTelegramId: {
      type: Number,
      default: null,
    },

    // For CREATOR_FEE: which market generated it
    marketId: {
      type: mongoose.Types.ObjectId,
      ref: "markets",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AdminWalletHistory",
  adminWalletHistorySchema,
  "adminWalletHistory"
);