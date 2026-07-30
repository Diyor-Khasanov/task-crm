import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve auth cookies
  const hasSession = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "session",
    "session_token",
    "auth-token",
    "token"
  ].some(cookieName => {
    const cookie = request.cookies.get(cookieName);
    return cookie && cookie.value;
  });

  // Protected paths
  const isProtectedPath = ["/dashboard", "/employees", "/tasks", "/profile"].some(
    path => pathname === path || pathname.startsWith(path + "/")
  );

  // Auth paths (only accessible when not logged in)
  const isAuthPath = pathname === "/login";

  if (isProtectedPath && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPath && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/tasks/:path*",
    "/profile/:path*",
    "/login"
  ],
};
