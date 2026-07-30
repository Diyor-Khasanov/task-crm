import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.CRM_API_BASE_URL || "https://for-interns.vercel.app/api";
const USE_MOCK_API = process.env.CRM_USE_MOCK_API === "true";

const knownSessionCookieNames = [
  "crm_session",
  "session",
  "session_token",
  "auth-token",
  "auth_token",
  "access_token",
  "refresh_token",
  "token",
  "corpcrm-session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "crm_user_role",
];

async function notifyRemoteLogout(request: NextRequest): Promise<string[]> {
  if (USE_MOCK_API) return [];

  const cookie = request.headers.get("cookie");
  if (!cookie) return [];

  const cookiesToForward: string[] = [];

  try {
    // 1. Fetch CSRF token from remote
    const csrfUrl = new URL(`${API_BASE_URL}/auth/csrf`);
    const csrfResponse = await fetch(csrfUrl, {
      method: "GET",
      headers: { cookie, accept: "application/json" },
      cache: "no-store",
    });

    if (csrfResponse.ok) {
      const csrfData = await csrfResponse.json().catch(() => ({}));
      const csrfToken = csrfData.csrfToken;

      if (csrfToken) {
        // Collect Set-Cookie headers from CSRF response
        const csrfSetCookieHeaders = typeof csrfResponse.headers.getSetCookie === "function"
          ? csrfResponse.headers.getSetCookie()
          : csrfResponse.headers.get("set-cookie")?.split(/,(?=[^;,]+=)/g) || [];

        let csrfCookieString = "";
        for (const header of csrfSetCookieHeaders) {
          const firstPart = header.split(";")[0];
          if (firstPart) {
            csrfCookieString += (csrfCookieString ? "; " : "") + firstPart;
          }
        }

        const combinedCookie = [cookie, csrfCookieString].filter(Boolean).join("; ");

        // 2. POST to signout with combined cookies and csrfToken
        const signoutUrl = new URL(`${API_BASE_URL}/auth/signout`);
        const signoutResponse = await fetch(signoutUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            cookie: combinedCookie,
            accept: "application/json",
          },
          body: new URLSearchParams({ csrfToken }).toString(),
          cache: "no-store",
          redirect: "manual",
        });

        if (signoutResponse.ok || signoutResponse.status === 302) {
          const signoutSetCookieHeaders = typeof signoutResponse.headers.getSetCookie === "function"
            ? signoutResponse.headers.getSetCookie()
            : signoutResponse.headers.get("set-cookie")?.split(/,(?=[^;,]+=)/g) || [];

          cookiesToForward.push(...signoutSetCookieHeaders);
        }
      }
    }
  } catch (error) {
    console.warn("Remote CRM logout notification failed:", error);
  }

  return cookiesToForward;
}

function expireCookie(response: NextResponse, name: string) {
  response.cookies.set({
    name,
    value: "",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    secure: true,
    sameSite: "lax",
    httpOnly: true,
  });
}

export async function POST(request: NextRequest) {
  const remoteCookies = await notifyRemoteLogout(request);

  const response = NextResponse.json({ success: true });

  // 1. Forward any remote cookie changes (e.g. session-token clearing)
  remoteCookies.forEach((cookieHeader) => {
    const cleanedCookie = cookieHeader.replace(/;\s*Domain=[^;]*/gi, "");
    response.headers.append("set-cookie", cleanedCookie);
  });

  // 2. Explicitly expire all known local session cookies
  const cookieNames = new Set([
    ...knownSessionCookieNames,
    ...request.cookies.getAll().map((cookie) => cookie.name),
  ]);

  cookieNames.forEach((name) => expireCookie(response, name));

  return response;
}
