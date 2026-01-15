import { ObjectId } from "mongodb";

export interface MessageDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
