import { NextResponse } from "next/server";
import { findEmployeeByEmail, publicEmployee, sessionCookieName } from "../../../lib/mockCrm";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const fieldErrors: Record<string, string[]> = {};
  if (!body.email) fieldErrors.email = ["Email is required."];
  if (!body.password) fieldErrors.password = ["Password is required."];
  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ success: false, error: { message: "Please complete the required fields.", fieldErrors } }, { status: 422 });
  }

  const employee = findEmployeeByEmail(String(body.email));
  if (!employee || employee.password !== body.password) {
    return NextResponse.json({ success: false, error: { message: "Invalid credentials." } }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, data: publicEmployee(employee) });
  response.cookies.set(sessionCookieName, employee.id, { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
