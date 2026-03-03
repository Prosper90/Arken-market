const mongoose = require("mongoose");

const userWalletSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "user", index: true },
    telegramId: { type: String },
    wallets: [
      {
        currencyName:   { type: String, default: "" },
        currencySymbol: { type: String, default: "" },
        currencyId:     { type: mongoose.Types.ObjectId, ref: "currency" },
        address:        { type: String, default: "", index: true },
        privateKey:     { type: String, default: "", index: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("userWallet", userWalletSchema, "userWallet");
