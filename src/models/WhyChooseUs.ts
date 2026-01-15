
import { ObjectId } from 'mongodb';

export interface Feature {
  _id: ObjectId;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
}

export interface WhyChooseUsData {
  title: string;
  subtitle: string;
  features: Feature[];
}

export interface WhyChooseUsDocument extends WhyChooseUsData {
  _id: ObjectId;
}
