import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // List of common session/auth cookie names
  const cookiesToClear = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "session",
    "session_token",
    "auth-token",
    "token",
    "corpcrm-session"
  ];

  for (const cookieName of cookiesToClear) {
    cookieStore.set(cookieName, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  return NextResponse.json({ success: true });
}
