import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findEmployeeById, publicEmployee, sessionCookieName } from "../../lib/mockCrm";

async function currentUser() {
  const cookieStore = await cookies();
  const id = cookieStore.get(sessionCookieName)?.value;
  return id ? findEmployeeById(id) : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ success: false, error: { message: "Unauthenticated." } }, { status: 401 });
  return NextResponse.json({ success: true, data: publicEmployee(user) });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ success: false, error: { message: "Unauthenticated." } }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const fieldErrors: Record<string, string[]> = {};
  if (!body.firstName?.trim()) fieldErrors.firstName = ["First name is required."];
  if (!body.lastName?.trim()) fieldErrors.lastName = ["Last name is required."];
  if (!body.position?.trim()) fieldErrors.position = ["Position is required."];
  if (Object.keys(fieldErrors).length) return NextResponse.json({ success: false, error: { message: "Please correct highlighted fields.", fieldErrors } }, { status: 422 });

  user.firstName = body.firstName.trim();
  user.lastName = body.lastName.trim();
  user.position = body.position.trim();
  user.phone = body.phone?.trim() || undefined;
  user.avatar = body.avatar?.trim() || "";
  return NextResponse.json({ success: true, data: publicEmployee(user) });
}
