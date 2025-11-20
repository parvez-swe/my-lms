import { ObjectId } from "mongodb";

export interface LessonCommentReply {
  _id?: ObjectId;
  userId: ObjectId | string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LessonCommentDocument {
  _id?: ObjectId;
  courseSlug: string;
  moduleIndex: number;
  lessonIndex: number;
  userId: ObjectId | string;
  userName: string;
  userImage?: string;
  text: string;
  replies: LessonCommentReply[];
  createdAt: Date;
  updatedAt?: Date;
}

