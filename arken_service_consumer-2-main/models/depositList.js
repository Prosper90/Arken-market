const mongoose = require("mongoose");

const depositListSchema = new mongoose.Schema(
  {
    Address: {
      type: String,
      index: true,
      required: true,
    },
     telegramId: {
      type: Number,
      index: true,
      required: true,
    },
   walletName: {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("depositList", depositListSchema);
