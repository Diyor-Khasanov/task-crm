import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findEmployeeById, sessionCookieName } from "../../../lib/mockCrm";

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const user = findEmployeeById(cookieStore.get(sessionCookieName)?.value || "");
  if (!user) return NextResponse.json({ success: false, error: { message: "Unauthenticated." } }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const fieldErrors: Record<string, string[]> = {};
  if (body.currentPassword !== user.password) fieldErrors.currentPassword = ["Current password is incorrect."];
  if (!body.newPassword || String(body.newPassword).length < 8) fieldErrors.newPassword = ["New password must be at least 8 characters."];
  if (body.newPassword !== body.confirmPassword) fieldErrors.confirmPassword = ["Passwords do not match."];
  if (Object.keys(fieldErrors).length) return NextResponse.json({ success: false, error: { message: "Please correct highlighted fields.", fieldErrors } }, { status: 422 });
  user.password = body.newPassword;
  return NextResponse.json({ success: true });
}
