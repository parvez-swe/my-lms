
import { ObjectId } from 'mongodb';

export interface Stat {
  _id: ObjectId;
  label: string;
  value: string;
}

export interface Socials {
  youtube: string;
  website: string;
  github: string;
  linkedin: string;
}

export interface AboutMeData {
  name: string;
  title: string;
  location: string;
  bio: string;
  mission: string;
  image: string;
  stats: Stat[];
  socials: Socials;
}

export interface AboutMeDocument extends AboutMeData {
  _id: ObjectId;
}
