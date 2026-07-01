import { ObjectId } from "mongodb";

export type EnrollmentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed";
export type CareerGoal = "freelance" | "abroad" | "job" | "remote-job";

export interface EnrollmentAddress {
  division: string;
  district: string;
}

export interface PaymentInfo {
  method: "bkash" | "nagad" | "sslcommerz" | "stripe" | "card" | "bank";
  bkashNumber?: string;
  nagadNumber?: string;
  transactionId: string;
  amount?: number;
  currency?: string;
  paidAt?: Date;
  gatewaySessionId?: string;
  paymentRecordId?: string;
}

export interface EnrollmentDocument {
  _id?: ObjectId;
  userId: ObjectId | string;
  courseSlug: string;
  status: EnrollmentStatus;
  enrolledAt?: Date;
  completedAt?: Date;
  // Personal Information
  phone?: string;
  currentJob?: string;
  careerGoal?: CareerGoal;
  address?: EnrollmentAddress;
  // Payment Information
  payment?: PaymentInfo;
  progress?: {
    completedLessons: string[]; // Array of "moduleIndex-lessonIndex" strings
    lastAccessed?: Date;
  };
  feedback?: {
    rating: number;
    comment?: string;
    submittedAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
