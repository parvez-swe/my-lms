import { ObjectId } from "mongodb";

export type UserRole =
  | "student"
  | "teacher"
  | "marketer"
  | "admin"
  | "superadmin"
  | "mentor";

export type CareerGoal = "freelance" | "abroad" | "job" | "remote-job";

export type InstructorProfileStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected";

export interface UserAddress {
  division: string;
  district: string;
}

export interface UserSocialLink {
  platform: "linkedin" | "twitter" | "github" | "website";
  url: string;
}

export interface UserDocument {
  _id?: ObjectId;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  image?: string;
  emailVerified?: Date;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  otp?: string;
  otpExpiry?: Date;
  otpAttempts?: number;
  phone?: string;
  currentJob?: string;
  careerGoal?: CareerGoal;
  address?: UserAddress;
  /** Short bio — shown on profile; teachers may use for instructor intro */
  bio?: string;
  /** Professional headline (teachers/marketers) */
  headline?: string;
  socialLinks?: UserSocialLink[];
  /** Teaching expertise / subjects (instructor profile) */
  expertise?: string;
  instructorProfileStatus?: InstructorProfileStatus;
  instructorProfileSubmittedAt?: Date;
  instructorProfileApprovedAt?: Date;
  instructorProfileRejectionReason?: string;
  /** False until user completes role-specific onboarding wizard */
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
