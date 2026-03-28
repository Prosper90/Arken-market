const mongoose = require("mongoose");

const userPublicWallet = mongoose.Schema(
  {
    telegramId: { type: String, unique: true, index: true },
    balance:     { type: Number, default: 0 },
    holdBalance: { type: Number, default: 0 },
    wallets: [
      {
        network: { type: String, default: "" },
        amount: { type: Number, default: 0, index: true },
        holdAmount: { type: Number, default: 0, index: true },
        address:{type: String, default: "", index: true},
        privateKey:{type: String, default: "", index: true},
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("userPublicWallet", userPublicWallet, "userPublicWallet");
