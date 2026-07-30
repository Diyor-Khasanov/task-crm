import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.CRM_API_BASE_URL || "https://for-interns.vercel.app/api";

const knownSessionCookieNames = [
  "crm_session",
  "session",
  "corpcrm-session",
  "token",
  "auth_token",
  "access_token",
  "refresh_token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

async function notifyRemoteLogout(request: NextRequest) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return;

  await Promise.any(
    ["auth/logout", "logout"].map(async (path) => {
      const remoteUrl = new URL(`${API_BASE_URL}/${path}`);
      const response = await fetch(remoteUrl, {
        method: "POST",
        headers: { cookie, accept: "application/json" },
        cache: "no-store",
        redirect: "manual",
      });

      if (response.status === 404 || response.status === 405) {
        throw new Error(`Remote logout endpoint ${path} returned ${response.status}`);
      }
    }),
  ).catch((error) => {
    console.warn("Remote CRM logout notification failed:", error);
  });
}

function expireCookie(response: NextResponse, name: string) {
  response.cookies.set({
    name,
    value: "",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function POST(request: NextRequest) {
  await notifyRemoteLogout(request);

  const response = NextResponse.json({ success: true });
  const cookieNames = new Set([
    ...knownSessionCookieNames,
    ...request.cookies.getAll().map((cookie) => cookie.name),
  ]);

  cookieNames.forEach((name) => expireCookie(response, name));

  return response;
}
