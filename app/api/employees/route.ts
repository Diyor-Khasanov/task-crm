import { NextResponse } from "next/server";
import { addEmployee, findEmployeeByEmail, getEmployees, publicEmployee } from "../../lib/mockCrm";

function page<T>(items: T[], pageNumber: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const data = items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  return { data, meta: { page: pageNumber, pageSize, total, totalPages, hasNextPage: pageNumber < totalPages, hasPreviousPage: pageNumber > 1 } };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.toLowerCase() || "";
  const role = url.searchParams.get("role");
  const status = url.searchParams.get("status");
  const pageNumber = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  const filtered = getEmployees().filter((employee) => {
    const matchesSearch = !search || `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.position}`.toLowerCase().includes(search);
    return matchesSearch && (!role || employee.role === role) && (!status || employee.status === status);
  }).map(publicEmployee);
  const result = page(filtered, pageNumber, pageSize);
  return NextResponse.json({ success: true, ...result });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const fieldErrors: Record<string, string[]> = {};
  for (const field of ["firstName", "lastName", "email", "password", "position"] as const) {
    if (!body[field]?.trim()) fieldErrors[field] = [`${field} is required.`];
  }
  if (body.email && findEmployeeByEmail(body.email)) fieldErrors.email = ["Email is already in use."];
  if (Object.keys(fieldErrors).length) return NextResponse.json({ success: false, error: { message: "Some fields need your attention.", fieldErrors } }, { status: 422 });
  const employee = addEmployee({ firstName: body.firstName.trim(), lastName: body.lastName.trim(), email: body.email.trim(), password: body.password, position: body.position.trim(), phone: body.phone, avatar: body.avatar || "", role: body.role || "EMPLOYEE", status: body.status || "ACTIVE" });
  return NextResponse.json({ success: true, data: publicEmployee(employee) }, { status: 201 });
}
