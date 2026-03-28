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
      dappPublicKey: {
    type: String,
    // required: true,
  },

  dappSecretKey: {
    type: String,
    // required: true,
    select: false,
  },
    uniqueId:{
      type: String,
      default: null,
    },
    connectedwalletName:{
      type:String,
      default: ""
    },
    connectedwalletAddress:{
      type:String,
      default: ""
    },
    jsonData:{
      type:String,
      default: ""
    },
    connectedwalletStatus:{
      type:Boolean,
      default: false
    },
    isConnected: {
  type: Boolean,
  default: false
},

createdAt: {
  type: Date,
  default: Date.now
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
