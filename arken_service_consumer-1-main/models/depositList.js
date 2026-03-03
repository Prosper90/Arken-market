const mongoose = require("mongoose");

const depositListSchema = new mongoose.Schema(
  {
      telegramId: {
      type: String,
      index: true,
      required: true,
    },
    Address: {
      type: String,
      index: true,
      required: true,
    },
     walletName: {
      type: String,
      index: true,
      required: true,
    },
     currencyId: {
      type: String,
      index: true,
      required: true,
    },
     currencySymbol: {
      type: String,
      index: true,
      required: true,
    },
      currencyImage: {
      type: String,
      index: true,
      default: "",
    },
     currencyName: {
      type: String,
      index: true,
      required: true,
    },
     status: {
      type: String,
      enum: ["PROCESSING", "CANCEL", "COMPLETE",],
      default: "PROCESSING",
      index: true,
    },
    Amount: {
      type: Number,
      index: true,
      required: true,
    },
    depositAddress: { type: String },
    AmountUSD:      { type: Number },
    chain:          { type: String },
    explorer:       { type: String },
    txHash:  { type: String, index: true, sparse: true, unique: true },
    source:  { type: String, default: "phantom" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("depositList", depositListSchema);


