import { NextRequest } from "next/server";
import { proxyApiRequest } from "../../remoteProxy";

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, "auth/login");
}
