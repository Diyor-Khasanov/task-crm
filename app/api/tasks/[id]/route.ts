import { NextRequest } from "next/server";
import { proxyApiRequest } from "../../remoteProxy";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyApiRequest(request, `tasks/${id}`);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyApiRequest(request, `tasks/${id}`);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyApiRequest(request, `tasks/${id}`);
}
