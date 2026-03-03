const mongoose = require("mongoose");
var Schema = mongoose.Schema;


const otpSchema = new Schema({
  telegramId: { type: String, required: true, index: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
}, { timestamps: true });



module.exports = mongoose.model('OTP', otpSchema, 'OTP');