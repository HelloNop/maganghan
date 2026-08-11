import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "admin" | "intern";
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "intern";
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "intern";
    mustChangePassword: boolean;
  }
}
