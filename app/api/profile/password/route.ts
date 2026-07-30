import { NextRequest } from "next/server";
import { proxyApiRequest } from "../../remoteProxy";

export async function PUT(request: NextRequest) {
  return proxyApiRequest(request, "profile/password");
}
