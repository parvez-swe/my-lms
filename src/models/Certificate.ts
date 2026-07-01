import { ObjectId } from "mongodb";

export interface CertificateDocument {
  _id?: ObjectId;
  userId: ObjectId;
  courseSlug: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  completionDate: Date;
  issuedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
