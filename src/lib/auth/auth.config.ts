import type { NextAuthConfig } from "next-auth";

const authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
  throw new Error("AUTH_SECRET environment variable is required. Generate one with: npx auth secret");
}

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.mustChangePassword = (user as unknown as { mustChangePassword: boolean }).mustChangePassword;
      }
      if (trigger === "update" && session) {
        token.mustChangePassword = session.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "intern";
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: authSecret,
  trustHost: true,
};
