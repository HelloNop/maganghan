import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth?.user && (role === "admin" || role === "intern");
  const mustChangePassword = req.auth?.user?.mustChangePassword;

  const isAuthRoute = nextUrl.pathname.startsWith("/login");
  const isChangePasswordRoute = nextUrl.pathname.startsWith("/ubah-password");
  const isInternRoute = nextUrl.pathname.startsWith("/intern");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  // const isApiImageRoute = nextUrl.pathname.startsWith("/api/image");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (mustChangePassword) {
        return NextResponse.redirect(new URL("/ubah-password", nextUrl));
      }
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin" : "/intern", nextUrl)
      );
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Force change password if required
  if (mustChangePassword && !isChangePasswordRoute) {
    return NextResponse.redirect(new URL("/ubah-password", nextUrl));
  }

  if (isAdminRoute && role !== "admin") {
    return NextResponse.redirect(new URL("/intern", nextUrl));
  }

  // Admin mencoba akses route intern — redirect ke dashboard admin
  if (isInternRoute && role !== "intern") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|models|public).*)"],
};
