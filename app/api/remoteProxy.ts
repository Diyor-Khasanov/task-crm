import { NextRequest, NextResponse } from "next/server";
import {
  addEmployee,
  findEmployeeByEmail,
  findEmployeeById,
  getEmployees,
  getTasks,
  publicEmployee,
  sessionCookieName,
  type EmployeeStatus,
  type Role,
  type TaskPriority,
  type TaskStatus,
} from "../lib/mockCrm";

const API_BASE_URL = process.env.CRM_API_BASE_URL || "https://for-interns.vercel.app/api";
const USE_MOCK_API = process.env.CRM_USE_MOCK_API !== "false";

function rewriteSetCookie(cookie: string) {
  const withoutRemoteDomain = cookie.replace(/;\s*Domain=[^;]*/gi, "");

  if (process.env.NODE_ENV === "production") {
    return withoutRemoteDomain;
  }

  return withoutRemoteDomain.replace(/;\s*Secure/gi, "");
}

function responseHeaders(remoteResponse: Response) {
  const headers = new Headers();
  const contentType = remoteResponse.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  return headers;
}

function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

function error(message: string, status = 400, fieldErrors?: Record<string, string[]>) {
  return json(
    { success: false, error: { code: status === 401 ? "UNAUTHORIZED" : "BAD_REQUEST", message, fieldErrors } },
    { status },
  );
}

function currentUser(request: NextRequest) {
  const userId = request.cookies.get(sessionCookieName)?.value;
  return userId ? findEmployeeById(userId) : undefined;
}

function requireUser(request: NextRequest) {
  const user = currentUser(request);
  if (!user) return { response: error("Authentication required.", 401) };
  return { user };
}

function withAssignee(task: ReturnType<typeof getTasks>[number]) {
  return { ...task, assignedTo: findEmployeeById(task.assignedToId) ? publicEmployee(findEmployeeById(task.assignedToId)!) : null };
}

function dashboardFor(user: NonNullable<ReturnType<typeof currentUser>>) {
  const tasks = getTasks();
  const employees = getEmployees();
  const visibleTasks = user.role === "ADMIN" ? tasks : tasks.filter((task) => task.assignedToId === user.id);
  const overdueTasks = visibleTasks.filter((task) => task.status !== "DONE" && new Date(task.dueDate) < new Date()).length;

  return {
    success: true,
    data: {
      scope: user.role,
      stats: {
        totalEmployees: employees.length,
        activeTasks: tasks.filter((task) => task.status !== "DONE").length,
        assignedTasks: visibleTasks.length,
        completedTasks: visibleTasks.filter((task) => task.status === "DONE").length,
        pendingTasks: visibleTasks.filter((task) => task.status !== "DONE").length,
        overdueTasks,
      },
      chart: [
        { label: "Mon", date: "2026-07-27", created: 2, completed: 1 },
        { label: "Tue", date: "2026-07-28", created: 1, completed: 2 },
        { label: "Wed", date: "2026-07-29", created: 3, completed: 1 },
      ],
      recentTasks: tasks.slice(0, 5).map(withAssignee),
      myTasks: visibleTasks.map(withAssignee),
      recentEmployees: employees.slice(0, 5).map(publicEmployee),
    },
  };
}

async function mockApiRequest(request: NextRequest, path: string) {
  const segments = path.replace(/^\/+|\/+$/g, "").split("/");
  const method = request.method;

  if (path === "auth/login" && method === "POST") {
    const body = await request.json().catch(() => ({}));
    const employee = typeof body.email === "string" ? findEmployeeByEmail(body.email) : undefined;
    if (!employee || employee.password !== body.password) return error("Invalid email or password.", 401);
    const response = json({ success: true, data: publicEmployee(employee) });
    response.cookies.set(sessionCookieName, employee.id, { httpOnly: true, sameSite: "lax", path: "/" });
    return response;
  }

  const auth = requireUser(request);
  if (auth.response) return auth.response;
  const user = auth.user;

  if (path === "profile") {
    if (method === "GET") return json({ success: true, data: publicEmployee(user) });
    if (method === "PUT") {
      const body = await request.json().catch(() => ({}));
      Object.assign(user, {
        firstName: body.firstName || user.firstName,
        lastName: body.lastName || user.lastName,
        position: body.position || user.position,
        phone: body.phone || user.phone,
        avatar: body.avatar || user.avatar,
      });
      return json({ success: true, data: publicEmployee(user) });
    }
  }

  if (path === "profile/password" && method === "PUT") return json({ success: true });
  if (path === "dashboard" && method === "GET") return json(dashboardFor(user));

  if (segments[0] === "employees") {
    if (segments[1] === "assignable") return json({ success: true, data: getEmployees().map(publicEmployee) });
    if (method === "GET" && !segments[1]) return json({ success: true, data: getEmployees().map(publicEmployee), meta: { page: 1, pageSize: 10, total: getEmployees().length, totalPages: 1, hasNextPage: false, hasPreviousPage: false } });
    if (method === "POST") {
      const body = await request.json().catch(() => ({}));
      const employee = addEmployee({ firstName: body.firstName, lastName: body.lastName, email: body.email, password: body.password, position: body.position, avatar: body.avatar || "", role: (body.role || "EMPLOYEE") as Role, status: (body.status || "ACTIVE") as EmployeeStatus, phone: body.phone });
      return json({ success: true, data: publicEmployee(employee) }, { status: 201 });
    }
    const employee = segments[1] ? findEmployeeById(segments[1]) : undefined;
    if (!employee) return error("Employee not found.", 404);
    if (method === "GET") return json({ success: true, data: publicEmployee(employee) });
    if (method === "PUT") {
      const body = await request.json().catch(() => ({}));
      Object.assign(employee, body, { password: body.password || employee.password });
      return json({ success: true, data: publicEmployee(employee) });
    }
    if (method === "DELETE") return json({ success: true });
  }

  if (segments[0] === "tasks") {
    const tasks = getTasks();
    if (method === "GET" && !segments[1]) return json({ success: true, data: tasks.map(withAssignee), meta: { page: 1, pageSize: 10, total: tasks.length, totalPages: 1, hasNextPage: false, hasPreviousPage: false } });
    if (method === "POST") {
      const body = await request.json().catch(() => ({}));
      const task = { id: `task-${Date.now()}`, title: body.title, description: body.description || "", priority: (body.priority || "MEDIUM") as TaskPriority, status: "TODO" as TaskStatus, dueDate: body.dueDate, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), assignedToId: body.assignedToId, createdById: user.id };
      tasks.unshift(task);
      return json({ success: true, data: withAssignee(task) }, { status: 201 });
    }
    const task = tasks.find((item) => item.id === segments[1]);
    if (!task) return error("Task not found.", 404);
    if (method === "GET") return json({ success: true, data: withAssignee(task) });
    if (method === "PUT" || method === "PATCH") {
      const body = await request.json().catch(() => ({}));
      Object.assign(task, body, { updatedAt: new Date().toISOString() });
      return json({ success: true, data: withAssignee(task) });
    }
    if (method === "DELETE") return json({ success: true });
  }

  return error("Mock endpoint not found.", 404);
}

export async function proxyApiRequest(request: NextRequest, path: string) {
  if (USE_MOCK_API) return mockApiRequest(request, path);

  const incomingUrl = new URL(request.url);
  const remoteUrl = new URL(`${API_BASE_URL}/${path.replace(/^\/+/, "")}`);
  remoteUrl.search = incomingUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const cookie = request.headers.get("cookie");
  const authorization = request.headers.get("authorization");

  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (cookie) headers.set("cookie", cookie);
  if (authorization) headers.set("authorization", authorization);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  let remoteResponse: Response;
  try {
    remoteResponse = await fetch(remoteUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (err) {
    console.warn("Remote CRM API unavailable; using bundled demo data instead.", err);
    return mockApiRequest(request, path);
  }

  const body = await remoteResponse.arrayBuffer();
  const response = new NextResponse(body, {
    status: remoteResponse.status,
    statusText: remoteResponse.statusText,
    headers: responseHeaders(remoteResponse),
  });

  const cookieHeaders =
    typeof remoteResponse.headers.getSetCookie === "function"
      ? remoteResponse.headers.getSetCookie()
      : remoteResponse.headers.get("set-cookie")?.split(/,(?=[^;,]+=)/g) || [];

  cookieHeaders.forEach((cookie) => {
    response.headers.append("set-cookie", rewriteSetCookie(cookie));
  });

  return response;
}
