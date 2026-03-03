const mongoose = require("mongoose");
const mongoose_paginate_v2 = require("mongoose-paginate-v2");

// EVENT SUB-SCHEMA
const eventSchema = new mongoose.Schema(
  {
    id: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },

    startDate: { type: Date },
    endDate: { type: Date },

    volume: { type: Number, default: 0 },
    liquidity: { type: Number, default: 0 },

    bestBid: { type: Number, default: 0 },
    bestAsk: { type: Number, default: 0 },

    outcomes: { type: Array, default: [] },       // e.g. ["YES", "NO"]
    outcomePrices: { type: Array, default: [] },  // e.g. [0.58, 0.42]

    image: { type: String, default: "" },
    icon: { type: String, default: "" },
  },
  { _id: false }
);

// MAIN POLYMARKET SCHEMA
const polyMarketSchema = new mongoose.Schema(
  {
    specifyId: {
      type: String,
      required: true,
      unique: true
    },

    // MAIN INFO
    question: { type: String, default: "" },
    description: { type: String, default: "" },
    tags: { type: Array, default: [] },
    category: { type: String, default: "Other" },
    subcategory: { type: String, default: null },


    // DATES
     newMarketdate: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    timeLeftSeconds: { type: Number, default: 0 },

    // POOLS & ODDS
    totalPool: { type: Number, default: 0 },
    yesPool: { type: Number, default: 0 },
    noPool: { type: Number, default: 0 },
    yesOdds: { type: String, default: "0" },
    noOdds: { type: String, default: "0" },

    // LIQUIDITY & VOLUME
    liquidity: { type: Number, default: 0 },
    totalLiquidity: { type: Number, default: 0 },
    volume24hr: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 },
    minimumLiquidity: { type: Number, default: 0 },
    estimatedNetworkFee: { type: Number, default: 0 },
    totalDeduction: { type: Number, default: 0 },

    // PRICES
    bestBid: { type: Number, default: 0 },
    bestAsk: { type: Number, default: 0 },

    outcomes: { type: Array, default: [] },       // ["Yes", "No"]
    outcomePrices: { type: Array, default: [] },  // [0.56, 0.44]
 outcomeTokenIds: { type: Map, of: String },
 clobTokenIds: { type: Array, default: [] }, 
    // ORDERBOOK UI PRICES
    buyYES: { type: String, default: "0" },
    sellYES: { type: String, default: "0" },
    buyNO: { type: String, default: "0" },
    sellNO: { type: String, default: "0" },

    // META
    participants: { type: Number, default: 0 },

    // STATUS
    active: { type: Boolean, default: false },
    new: { type: Boolean, default: false },
    currency: {
      type: String,
      default: null,
      index: true
    },
    closed: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },

    // EXTRA DATA
    resolution: { type: String, default: "" },
    umaResolutionStatus: { type: String, default: "" },
    umaResolutionStatuses: { type: Array, default: [] },

    conditionId: { type: String, default: "" },
    slug: { type: String, default: "" },

    groupItemTitle: { type: String, default: "" },
    acceptingOrders: { type: Boolean, default: false },

    // EVENTS
    events: { type: [eventSchema], default: [] },
  },
  { timestamps: true }
);

polyMarketSchema.virtual("editable").get(() => false);

polyMarketSchema.plugin(mongoose_paginate_v2);

module.exports = mongoose.model("polymarket", polyMarketSchema);
