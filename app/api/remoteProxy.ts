import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://for-interns.vercel.app/api";

function rewriteSetCookie(cookie: string) {
  return cookie
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*Secure/gi, "");
}

function responseHeaders(remoteResponse: Response) {
  const headers = new Headers();
  const contentType = remoteResponse.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  return headers;
}

export async function proxyApiRequest(request: NextRequest, path: string) {
  const incomingUrl = new URL(request.url);
  const remoteUrl = new URL(`${API_BASE_URL}/${path.replace(/^\/+/, "")}`);
  remoteUrl.search = incomingUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const cookie = request.headers.get("cookie");

  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (cookie) headers.set("cookie", cookie);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  let remoteResponse: Response;
  try {
    remoteResponse = await fetch(remoteUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (error) {
    console.error("Remote CRM API request failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Could not reach the remote CRM API. Please try again shortly.",
        },
      },
      { status: 503 },
    );
  }

  const body = await remoteResponse.arrayBuffer();
  const response = new NextResponse(body, {
    status: remoteResponse.status,
    statusText: remoteResponse.statusText,
    headers: responseHeaders(remoteResponse),
  });

  remoteResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      response.headers.append("set-cookie", rewriteSetCookie(value));
    }
  });

  return response;
}
