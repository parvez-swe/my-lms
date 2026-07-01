import { ObjectId } from "mongodb";

export type PaymentMethod =
  | "bkash"
  | "nagad"
  | "sslcommerz"
  | "stripe"
  | "card"
  | "bank";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export interface PaymentTransactionDocument {
  _id?: ObjectId;
  userId: ObjectId;
  courseSlug: string;
  enrollmentId?: ObjectId;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  /** Manual payment: sender wallet number */
  payerNumber?: string;
  /** Manual payment: TrxID from SMS */
  transactionId?: string;
  /** Gateway session / payment intent id */
  gatewaySessionId?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  redirectUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
