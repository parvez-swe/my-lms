import { ObjectId } from "mongodb";

export interface FaqItem {
  _id?: ObjectId; // Changed to ObjectId
  question: string;
  answer: string;
}

export interface FaqData {
  title: string;
  subtitle: string;
  faqs: FaqItem[];
}

export interface FaqDocument extends FaqData {
  _id?: ObjectId; // Changed to ObjectId and made optional
}
