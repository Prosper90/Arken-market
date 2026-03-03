const mongoose = require("mongoose");

const adminWalletSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "user", index: true },
    telegramId: { type: String },
    wallets: [
      {
        currencyName: { type: String, default: "" },
        currencySymbol: { type: String, default: "" },
        currencyId: { type: mongoose.Types.ObjectId, ref: "currency" },
        amount: { type: Number, default: 0, index: true },
        holdAmount: { type: Number, default: 0, index: true },
        address:{type: String, default: "", index: true},
        privateKey:{type: String, default: "", index: true},
        // p2p: { type: Number, default: 0, index: true },
        // p2phold: { type: Number, default: 0, index: true },
        // reserved: { type: Number, default: 0, index: true },
        // stakeAmount: { type: Number, default: 0, index: true },
        // stakeHold: { type: Number, default: 0, index: true },
        // FlexstakeAmount: { type: Number, default: 0, index: true },
        // FlexstakeHold: { type: Number, default: 0, index: true },
        // escrow: { type: Number, default: 0, index: true },
      },
    ],
    spot_wallet: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("adminWallet", adminWalletSchema, "adminWallet");
