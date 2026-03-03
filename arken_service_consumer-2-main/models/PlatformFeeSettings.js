const mongoose = require("mongoose");

const platformFeeSettingsSchema = new mongoose.Schema(
  {
    feePercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 1,
    },

    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PlatformFeeSettings",
  platformFeeSettingsSchema
);
