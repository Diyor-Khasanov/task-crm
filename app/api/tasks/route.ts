import { NextRequest } from "next/server";
import { proxyApiRequest } from "../remoteProxy";

export async function GET(request: NextRequest) {
  return proxyApiRequest(request, "tasks");
}

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, "tasks");
}
