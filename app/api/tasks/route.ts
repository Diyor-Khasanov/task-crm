import { NextResponse } from "next/server";
import { findEmployeeById, getTasks, publicEmployee } from "../../lib/mockCrm";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.toLowerCase() || "";
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const pageNumber = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  const items = getTasks()
    .filter((task) => (!search || `${task.title} ${task.description}`.toLowerCase().includes(search)) && (!status || task.status === status) && (!priority || task.priority === priority))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((task) => ({ ...task, assignedTo: task.assignedToId ? publicEmployee(findEmployeeById(task.assignedToId)!) : null, createdBy: task.createdById ? publicEmployee(findEmployeeById(task.createdById)!) : null }));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const data = items.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  return NextResponse.json({ success: true, data, meta: { page: pageNumber, pageSize, total, totalPages, hasNextPage: pageNumber < totalPages, hasPreviousPage: pageNumber > 1 } });
}
