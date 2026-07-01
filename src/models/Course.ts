import { ObjectId } from "mongodb";

export type CourseStatus =
  | "draft"
  | "pending_approval"
  | "published"
  | "rejected";

export interface CourseDocument {
  _id?: ObjectId;
  slug: string;
  title: string;
  price: string;
  priceAmount?: number;
  currency?: string;
  pricingType?: "free" | "paid";
  image: string;
  tutor: string;
  tutorImage: string;
  instructorId?: string;
  instructorEmail?: string;
  lessons: number;
  students: number;
  description: string;
  tutorBio?: string;
  tutorSocials?: {
    platform: "linkedin" | "twitter" | "github";
    url: string;
  }[];
  modules: {
    title: string;
    lessons: {
      title: string;
      duration: string;
      videoType?: "youtube" | "cloudinary" | "url";
      videoUrl?: string;
      cloudinaryPublicId?: string;
      isPublic?: boolean;
      resources?: {
        name: string;
        url: string;
      }[];
    }[];
  }[];
  ratingAverage?: number;
  ratingCount?: number;
  status?: CourseStatus;
  statusRejectionReason?: string;
  submittedAt?: Date;
  publishedAt?: Date;
  faqs?: {
    question: string;
    answer: string;
  }[];
  testimonials?: {
    studentName: string;
    studentImage: string;
    rating: number;
    comment: string;
  }[];
  successStories?: {
    studentName: string;
    studentImage: string;
    story: string;
    projectUrl?: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
