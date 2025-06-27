// lib/models/OTP.ts - Separate OTP collection (keeps User model unchanged)
import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
  expiresAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes (300 seconds) - MongoDB will auto-delete
  }
});

// Index for faster email lookups
OTPSchema.index({ email: 1 });

// Compound index for email + expiration
OTPSchema.index({ email: 1, expiresAt: 1 });

const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;