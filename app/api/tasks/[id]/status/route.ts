import { NextRequest } from "next/server";
import { proxyApiRequest } from "../../../remoteProxy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyApiRequest(request, `tasks/${id}/status`);
}
