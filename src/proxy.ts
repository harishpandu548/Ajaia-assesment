import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /documents routes — check for NextAuth session cookie
  if (pathname.startsWith("/documents")) {
    const sessionToken =
      request.cookies.get("next-auth.session-token") ||
      request.cookies.get("__Secure-next-auth.session-token");

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*"],
};
