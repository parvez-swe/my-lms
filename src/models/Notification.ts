import { ObjectId } from "mongodb";

export type NotificationType =
  | "enrollment_approved"
  | "enrollment_rejected"
  | "course_update"
  | "new_message";

export interface NotificationDocument {
  _id?: ObjectId;
  userId: ObjectId;
  type: NotificationType;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}
