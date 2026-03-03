const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema(
  {
    // The person who shared the referral link
    referrerId: {
      type: Number,
      required: true,
      index: true,
    },

    // The person who joined via the link (or via a group the referrer owns)
    referredUserId: {
      type: Number,
      required: true,
      unique: true, // each user can only be referred once
      index: true,
    },

    // How the referral happened
    source: {
      type: String,
      enum: ["link", "group"],
      default: "link",
    },

    // For group-based referrals: the Telegram group ID
    groupId: {
      type: Number,
      default: null,
    },

    // Lifetime earnings from this referred user
    totalEarned: {
      type: Number,
      default: 0,
    },

    // Total trade volume from this referred user (for tracking)
    totalVolume: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referral", referralSchema);
