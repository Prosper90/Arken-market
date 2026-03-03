const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },

    telegramId: {
      type: Number,
      index: true,
      required: true,
    },

    marketId: {
      type: Number,
      index: true,
    },
   manualId: {
  type: mongoose.Types.ObjectId,
  ref: "markets",
  index: true,
},
    conditionId: {
      type: String,
      index: true,
    },

    outcomeIndex: {
      type: Number,
      required: true,
    },


     currentPrice: {         
      type: Number,
      default: 0,
    },
    
    unrealizedPnl: {         
      type: Number,
      default: 0,
    },
    outcomeLabel: {
      type: String,
      required: true,
    },
    question: {
      type: String,
     default: null,
    },

    source: {
  type: String,
  enum: ["manual", "poly"],
  required: true,
  index: true,
},

groupId: {
  type: Number,
  default: null,
  index: true
},
chatType: {
  type: String,
  enum: ["private", "group", "supergroup"],
  default: "private"
},

    amount: {
      type: Number,
      required: true,
    },

    odds: {
      type: Number,
      required: true,
    },

    shares: {
      type: Number,
      required: true,
    },

    potentialPayout: {
      type: Number,
      required: true,
    },

    potentialProfit: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      index: true,
    },
    deductedFrom: { type: String, default: "" },

    status: {
      type: String,
      enum: ["OPEN", "WON", "LOST", "CLOSED"],
      default: "OPEN",
      index: true,
    },

    resolvedOutcome: {
      type: String, 
      default: null,
    },
    tokenId: {
      type: String, 
      default: null,
    },

    finalPayout: {
      type: Number,
      default: 0,
    },

     avgPrice: {            
      type: Number,
      required: true,
    },

    settledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
