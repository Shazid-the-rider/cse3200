const mongoose = require("mongoose");

const passwordResetSchema = new mongoose.Schema(
  {
    gmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PasswordReset",
  passwordResetSchema
);