import "next-auth";
import { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      image?: string;
      onboardingCompleted?: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string;
    onboardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    id: string;
    onboardingCompleted?: boolean;
  }
}
