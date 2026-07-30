export type Role = "ADMIN" | "EMPLOYEE";
export type EmployeeStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  position: string;
  avatar: string;
  role: Role;
  status: EmployeeStatus;
  createdAt: string;
  phone?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  assignedToId: string;
  createdById: string;
}

export const sessionCookieName = "corpcrm-session";

const employees: Employee[] = [
  {
    id: "emp-admin",
    firstName: "Maya",
    lastName: "Stone",
    email: "admin@corpcrm.dev",
    password: "Admin123!",
    position: "Head of Operations",
    avatar: "https://i.pravatar.cc/160?img=47",
    role: "ADMIN",
    status: "ACTIVE",
    phone: "+1 (415) 555-0137",
    createdAt: "2026-02-12T09:00:00.000Z",
  },
  {
    id: "emp-alice",
    firstName: "Alice",
    lastName: "Freeman",
    email: "alice.freeman@corpcrm.dev",
    password: "Employee123!",
    position: "Account Executive",
    avatar: "https://i.pravatar.cc/160?img=32",
    role: "EMPLOYEE",
    status: "ACTIVE",
    phone: "+1 (212) 555-0184",
    createdAt: "2026-03-08T10:30:00.000Z",
  },
  {
    id: "emp-noah",
    firstName: "Noah",
    lastName: "Chen",
    email: "noah.chen@corpcrm.dev",
    password: "Employee123!",
    position: "Customer Success Manager",
    avatar: "https://i.pravatar.cc/160?img=12",
    role: "EMPLOYEE",
    status: "ON_LEAVE",
    createdAt: "2026-04-18T14:15:00.000Z",
  },
  {
    id: "emp-priya",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya.nair@corpcrm.dev",
    password: "Employee123!",
    position: "Sales Development Rep",
    avatar: "https://i.pravatar.cc/160?img=5",
    role: "EMPLOYEE",
    status: "ACTIVE",
    createdAt: "2026-05-02T08:45:00.000Z",
  },
];

const tasks: Task[] = [
  {
    id: "task-1",
    title: "Prepare Q3 renewal brief",
    description: "Collect account health notes and risks for enterprise renewals.",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: "2026-08-05T17:00:00.000Z",
    createdAt: "2026-07-20T12:00:00.000Z",
    updatedAt: "2026-07-28T15:00:00.000Z",
    assignedToId: "emp-alice",
    createdById: "emp-admin",
  },
  {
    id: "task-2",
    title: "Audit stale opportunities",
    description: "Review opportunities with no activity in the last 30 days.",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "2026-08-09T17:00:00.000Z",
    createdAt: "2026-07-22T09:00:00.000Z",
    updatedAt: "2026-07-22T09:00:00.000Z",
    assignedToId: "emp-priya",
    createdById: "emp-admin",
  },
  {
    id: "task-3",
    title: "Finalize onboarding checklist",
    description: "Publish a clean checklist for the implementation team.",
    priority: "LOW",
    status: "DONE",
    dueDate: "2026-07-25T17:00:00.000Z",
    createdAt: "2026-07-12T11:00:00.000Z",
    updatedAt: "2026-07-24T16:00:00.000Z",
    assignedToId: "emp-noah",
    createdById: "emp-admin",
  },
];

export function publicEmployee(employee: Employee) {
  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    position: employee.position,
    avatar: employee.avatar,
    role: employee.role,
    status: employee.status,
    createdAt: employee.createdAt,
    phone: employee.phone,
  };
}

export function findEmployeeByEmail(email: string) {
  return employees.find((employee) => employee.email.toLowerCase() === email.toLowerCase());
}

export function findEmployeeById(id: string) {
  return employees.find((employee) => employee.id === id);
}

export function getEmployees() {
  return employees;
}

export function getTasks() {
  return tasks;
}

export function addEmployee(input: Omit<Employee, "id" | "createdAt">) {
  const employee: Employee = { ...input, id: `emp-${Date.now()}`, createdAt: new Date().toISOString() };
  employees.unshift(employee);
  return employee;
}

export function removeEmployee(id: string) {
  const index = employees.findIndex((employee) => employee.id === id);
  if (index >= 0) employees.splice(index, 1);
  return index >= 0;
}
