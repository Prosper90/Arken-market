const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    groupTitle: {
      type: String,
      required: true,
    },

    groupOwnerId: {
      type: Number,
      required: true,
    },

    commissionPercent: {
      type: Number,
      default: 5, 
      min: 0,
      max: 20,
    },

    bettingEnabled: {
      type: Boolean,
      default: false,
    },

    botIsAdmin: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TelegramGroup", groupSchema);
