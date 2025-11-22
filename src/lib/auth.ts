import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDatabase } from "@/lib/mongodb";
import { UserDocument, UserRole } from "@/models/User";
import bcrypt from "bcryptjs";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set in environment variables");
}

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = await getDatabase();
          const user = await db
            .collection<UserDocument>("users")
            .findOne({ email: credentials.email as string });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Check if email is verified - return null if not verified
          // We'll handle the error message in the signIn callback
          if (!user.emailVerified) {
            return null;
          }

          return {
            id: user._id?.toString() || "",
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error: unknown) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const role = (token.role as string) || "student";
        session.user.role = role as UserRole;
        session.user.id = (token.id as string) || "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/authentication/sign-in",
    error: "/authentication/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig;

// Create auth instance for use in API routes
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
