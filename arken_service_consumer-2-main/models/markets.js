const mongoose = require("mongoose");
const mongoose_paginate_v2 = require("mongoose-paginate-v2");

const marketSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    description: { type: String, default: "" },
    
    tags: { type: Array, default: [] },

    image: { type: String, default: "" },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },

    liquidity: { type: Number, default: 0 },
    minimumLiquidity: { type: Number, default: 0 },
    estimatedNetworkFee: { type: Number, default: 0 },
    totalLiquidity: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 },
    totalDeduction: { type: Number, default: 0 },
    oracleFixedFee: { type: Number, default: 0 },

    outcomes: { type: [String], default: [] },
    outcomePrices: { type: [Number], default: [] },
    chancePercents: { type: [Number], default: [] },

    bestBid: { type: Number, default: 0 },
    bestAsk: { type: Number, default: 0 },

    resolution: {
      type: Number,
      default: 1,
      comment: "1-manual 2-automatic",
    },
     currency: {
  type: String,
  default: null,   
  index: true    
},
    category: { type: String, default: "Other" },


    active: { type: Boolean, default: false },
    closed: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    new: { type: Boolean, default: false },

    slug: { type: String, default: "" },
    acceptingOrders: { type: Boolean, default: false },

    // Private vs public market
    isPrivate: { type: Boolean, default: false },
    allowedTelegramIds: { type: [Number], default: [] },

    // Creator tracking (for revenue share)
    creatorTelegramId: { type: Number, default: null },

    // Oracle type for resolution
    oracleType: {
      type: String,
      enum: ["manual", "ai", "uma", "polymarket"],
      default: "manual",
    },

    // Lifecycle status
    marketStatus: {
      type: String,
      enum: ["pending", "active", "closed", "resolved"],
      default: "active",
    },

    // AI oracle resolution result
    aiResolution: {
      verdict: { type: String, default: null },
      confidence: { type: Number, default: null },
      source: { type: String, default: null },
      resolvedAt: { type: Date, default: null },
    },

    // UMA oracle tracking
    umaAssertionId: { type: String, default: null },
    umaVerdict: { type: String, default: null },
    umaSubmittedAt: { type: Date, default: null },

    // Per-user LP positions
    lpProviders: [
      {
        telegramId: { type: Number },
        amount: { type: Number },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // On-chain identifiers
    source: {
      type: String,
      enum: ["manual", "poly", "arken", "solana"],
      default: "manual",
      index: true,
    },
    arkenMarketAddress: { type: String, default: null, index: true },
    solanaMarketId: { type: String, default: null, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

marketSchema.virtual("editable").get(() => true);

marketSchema.plugin(mongoose_paginate_v2);

module.exports = mongoose.model("markets", marketSchema);
