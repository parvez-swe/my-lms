import { ObjectId } from "mongodb";

export interface DiscussionReply {
  _id?: ObjectId;
  userId: ObjectId | string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DiscussionDocument {
  _id?: ObjectId;
  courseSlug: string;
  userId: ObjectId | string;
  userName: string;
  userImage?: string;
  text: string;
  likes: ObjectId[] | string[]; // Array of user IDs who liked
  replies: DiscussionReply[];
  createdAt: Date;
  updatedAt?: Date;
}

