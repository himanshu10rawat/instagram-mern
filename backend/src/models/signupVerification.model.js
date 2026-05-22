import mongoose from "mongoose";

const signupVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    emailOtpHash: {
      type: String,
      required: true,
      select: false,
    },

    attempts: {
      type: Number,
      default: 0,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

signupVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SignupVerification = mongoose.model("SignupVerification", signupVerificationSchema);

export default SignupVerification;
