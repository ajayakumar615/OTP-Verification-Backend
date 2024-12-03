const mongoose = require('mongoose');

const userOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpCreatedAt: { type: Date }, // ^ Timestamp for when OTP was created
});

module.exports = mongoose.model('UserOTP', userOtpSchema);