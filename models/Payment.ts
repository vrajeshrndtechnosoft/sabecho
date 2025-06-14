// lib/models/Payment.ts
import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface
interface Payment {
  paymentId?: string;
  orderId?: string;
  amount?: number;
  status?: string;
  orderDetails?: object;
  paymentDetails?: object;
  createdAt: Date;
}

interface PaymentDocument extends Document, Payment {}

const paymentSchema = new Schema<PaymentDocument>({
  paymentId: String,
  orderId: String,
  amount: Number,
  status: String,
  orderDetails: Object,
  paymentDetails: Object,
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.models.Payment || mongoose.model<PaymentDocument>('Payment', paymentSchema);

export default Payment;