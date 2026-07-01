import { Db, ObjectId } from "mongodb";
import {
  NotificationDocument,
  NotificationType,
} from "@/models/Notification";

export { formatTimeAgo } from "./timeAgo";

export async function createNotification(
  db: Db,
  params: {
    userId: ObjectId | string;
    type: NotificationType;
    message: string;
    link: string;
  }
): Promise<void> {
  const userId =
    typeof params.userId === "string"
      ? new ObjectId(params.userId)
      : params.userId;

  const notification: NotificationDocument = {
    userId,
    type: params.type,
    message: params.message,
    link: params.link,
    read: false,
    createdAt: new Date(),
  };

  await db.collection<NotificationDocument>("notifications").insertOne(
    notification
  );
}
