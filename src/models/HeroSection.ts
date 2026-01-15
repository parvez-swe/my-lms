
import { ObjectId } from 'mongodb';

export interface SocialProof {
  avatars: string[];
  happyLearners: string;
  rating: string;
  numberOfRatings: string;
}

export interface HeroSectionDocument {
  _id: ObjectId;
  title: string;
  accentText: string;
  subtitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  mainImage: string;
  socialProof: SocialProof;
}
