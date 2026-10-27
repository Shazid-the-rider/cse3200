const crypto = require("crypto");
const nodemailer = require("nodemailer");

const Admin = require("../../models/admin");
const PasswordReset = require("../../models/PasswordReset");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASSWORD?.replace(/\s/g, ""),
  },
});

function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

// STEP 1: Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const gmail = String(req.body.gmail || "")
      .trim()
      .toLowerCase();

    if (!gmail) {
      return res.status(400).json({
        message: "Gmail is required",
      });
    }

    const admin = await Admin.findOne({ gmail });

    // একই response দিয়ে account enumeration কমানো
    if (!admin) {
      return res.json({
        message:
          "If this Gmail is registered, an OTP has been sent.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await PasswordReset.findOneAndUpdate(
      { gmail },
      {
        gmail,
        otpHash: hashOTP(otp),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    try {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: gmail,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
      });
    } catch (emailError) {
      await PasswordReset.deleteOne({ gmail });
      throw emailError;
    }

    return res.json({
      message:
        "If this Gmail is registered, an OTP has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Unable to send OTP. Please try again.",
    });
  }
};

// STEP 2: Verify OTP and change password
exports.resetPassword = async (req, res) => {
  try {
    const gmail = String(req.body.gmail || "")
      .trim()
      .toLowerCase();

    const otp = String(req.body.otp || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!gmail || !otp || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "OTP must contain 6 digits",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const reset = await PasswordReset.findOne({ gmail });

    if (!reset || reset.expiresAt.getTime() <= Date.now()) {
      if (reset) {
        await PasswordReset.deleteOne({ _id: reset._id });
      }

      return res.status(400).json({
        message: "OTP expired or invalid. Request a new OTP.",
      });
    }

    if (reset.attempts >= 5) {
      await PasswordReset.deleteOne({ _id: reset._id });

      return res.status(400).json({
        message: "Too many attempts. Request a new OTP.",
      });
    }

    if (hashOTP(otp) !== reset.otpHash) {
      reset.attempts += 1;

      if (reset.attempts >= 5) {
        await PasswordReset.deleteOne({ _id: reset._id });

        return res.status(400).json({
          message: "Too many attempts. Request a new OTP.",
        });
      }

      await reset.save();

      return res.status(400).json({
        message: "Incorrect OTP",
      });
    }

    const admin = await Admin.findOne({ gmail });

    if (!admin) {
      await PasswordReset.deleteOne({ _id: reset._id });

      return res.status(400).json({
        message: "Unable to reset password",
      });
    }

    admin.password = newPassword;
    await admin.save();

    await PasswordReset.deleteOne({ _id: reset._id });

    return res.json({
      message: "Password reset successful. Please log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Unable to reset password",
    });
  }
};