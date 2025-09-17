import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import { env } from "./env";

// Check if we have valid Google OAuth credentials
const hasValidGoogleCredentials = 
  env.GOOGLE_CLIENT_ID && 
  env.GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" &&
  env.GOOGLE_CLIENT_SECRET && 
  env.GOOGLE_CLIENT_SECRET !== "YOUR_GOOGLE_CLIENT_SECRET_HERE";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: hasValidGoogleCredentials ? [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }),
  ] : [],
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: true,
  secret: env.NEXTAUTH_SECRET,
};
