const mongoose = require("mongoose");
const mongoose_paginate_v2 = require("mongoose-paginate-v2");

const EventSchema = new mongoose.Schema({
  title: { type: String },
  slug: { type: String },
  startDate: { type: Date, default: Date.now() },
  endDate: { type: Date ,default : Date.now() + 24*60*60*1000 },
  startTime: { type: Date ,default: Date.now() },
  endTime: { type: Date , default : Date.now() + 24*60*60*1000},
  active: { type: Boolean, default: true },
  closed: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
},{timestamps: true});

EventSchema.index({slug:1}, {unique: true});

EventSchema.plugin(mongoose_paginate_v2);

module.exports = mongoose.model("events", EventSchema);