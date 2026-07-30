import { NextResponse } from "next/server";
import { getEmployees, getTasks, publicEmployee, findEmployeeById } from "../../lib/mockCrm";

export async function GET() {
  const employees = getEmployees();
  const tasks = getTasks();
  const activeTasks = tasks.filter((task) => task.status !== "DONE").length;
  const completedTasks = tasks.filter((task) => task.status === "DONE").length;
  const pendingTasks = tasks.filter((task) => task.status === "TODO" || task.status === "IN_PROGRESS").length;
  const overdueTasks = tasks.filter((task) => task.status !== "DONE" && new Date(task.dueDate) < new Date()).length;
  const hydratedTasks = tasks.map((task) => ({ ...task, assignedTo: publicEmployee(findEmployeeById(task.assignedToId)!) }));
  return NextResponse.json({
    success: true,
    data: {
      scope: "ADMIN",
      stats: { totalEmployees: employees.length, activeTasks, completedTasks, pendingTasks, overdueTasks },
      chart: [
        { label: "Mon", date: "2026-07-27", created: 2, completed: 1 },
        { label: "Tue", date: "2026-07-28", created: 1, completed: 1 },
        { label: "Wed", date: "2026-07-29", created: 3, completed: 0 },
      ],
      recentTasks: hydratedTasks,
      recentEmployees: employees.slice(0, 5).map(publicEmployee),
    },
  });
}
