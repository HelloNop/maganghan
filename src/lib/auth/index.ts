import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { loginSchema } from "../validators/auth";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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

      // Check if user still exists in DB
      if (token?.id) {
        try {
          const dbUser = await db
            .select({ id: users.id, statusAktif: users.statusAktif })
            .from(users)
            .where(eq(users.id, token.id as string))
            .limit(1);

          if (dbUser.length === 0 || !dbUser[0].statusAktif) {
            token.id = undefined;
            token.sub = undefined;
            token.role = undefined;
          }
        } catch (err) {
          console.error("JWT DB validation error:", err);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "intern";
        session.user.mustChangePassword = token.mustChangePassword as boolean;
      } else {
        delete (session as any).user;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        try {
          const userList = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase().trim()))
            .limit(1);

          if (userList.length === 0) {
            return null;
          }

          const user = userList[0];

          if (!user.statusAktif) {
            throw new Error("Akun Anda telah dinonaktifkan.");
          }

          const passwordMatch = await bcrypt.compare(password, user.passwordHash);

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            name: user.nama,
            email: user.email,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      },
    }),
  ],
});
