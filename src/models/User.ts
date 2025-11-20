import { ObjectId } from "mongodb";

export type UserRole = "student" | "mentor" | "admin" | "superadmin";
export type CareerGoal = "freelance" | "abroad" | "job" | "remote-job";

export interface UserAddress {
  division: string;
  district: string;
}

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  password: string; // Hashed password
  name: string;
  role: UserRole;
  image?: string;
  emailVerified?: Date;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  otp?: string; // One-time password for email verification
  otpExpiry?: Date; // OTP expiration time
  otpAttempts?: number; // Number of failed OTP attempts
  // Personal Information
  phone?: string;
  currentJob?: string;
  careerGoal?: CareerGoal;
  address?: UserAddress;
  createdAt?: Date;
  updatedAt?: Date;
}
