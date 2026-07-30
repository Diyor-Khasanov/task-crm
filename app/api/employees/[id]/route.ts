import { NextResponse } from "next/server";
import { findEmployeeById, publicEmployee, removeEmployee } from "../../../lib/mockCrm";

export async function PUT(request: Request, context: RouteContext<"/api/employees/[id]">) {
  const { id } = await context.params;
  const employee = findEmployeeById(id);
  if (!employee) return NextResponse.json({ success: false, error: { message: "Employee not found." } }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  employee.firstName = body.firstName?.trim() || employee.firstName;
  employee.lastName = body.lastName?.trim() || employee.lastName;
  employee.position = body.position?.trim() || employee.position;
  employee.phone = body.phone?.trim() || undefined;
  employee.avatar = body.avatar?.trim() || "";
  employee.role = body.role || employee.role;
  employee.status = body.status || employee.status;
  if (body.password) employee.password = body.password;
  return NextResponse.json({ success: true, data: publicEmployee(employee) });
}

export async function DELETE(_request: Request, context: RouteContext<"/api/employees/[id]">) {
  const { id } = await context.params;
  if (!removeEmployee(id)) return NextResponse.json({ success: false, error: { message: "Employee not found." } }, { status: 404 });
  return NextResponse.json({ success: true });
}
