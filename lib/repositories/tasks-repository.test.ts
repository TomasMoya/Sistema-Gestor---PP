import { beforeEach, describe, expect, it, vi } from "vitest";
import { tasksRepository } from "./tasks-repository";
import type { Category } from "@/types/category";
import type { Task as DbTask } from "@/types/task";

const CATEGORIES: Category[] = [{ id: "c1", user_id: "u1", nombre: "Hogar", tipo: "gasto", icono: "home", created_at: "2026-01-01" }];

function dbTask(overrides: Partial<DbTask> = {}): DbTask {
  return {
    id: "t1",
    user_id: "u1",
    category_id: null,
    titulo: "Tarea",
    nota: null,
    fecha_vencimiento: "2026-10-29",
    costo_previsto: null,
    prioridad: "media",
    estado: "pendiente",
    recordatorio: null,
    es_pago: false,
    eliminado: false,
    created_at: "2026-01-01",
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return { ok: status < 300, status, json: async () => body } as Response;
}

/** Enruta por método + path, como hace la API real (`/api/tasks`, `/api/tasks/:id`, `/api/categories`). */
function mockFetch(handlers: { get?: (url: string) => Response; patch?: (url: string, body: unknown) => Response; post?: (url: string, body: unknown) => Response }) {
  return vi.fn((url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    if (url === "/api/categories") return Promise.resolve(jsonResponse(CATEGORIES));
    if (method === "GET" && handlers.get) return Promise.resolve(handlers.get(url));
    if (method === "PATCH" && handlers.patch) return Promise.resolve(handlers.patch(url, body));
    if (method === "POST" && handlers.post) return Promise.resolve(handlers.post(url, body));
    throw new Error(`Llamada inesperada: ${method} ${url}`);
  });
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_DEFAULT_USER_ID = "u1";
});

describe("tasksRepository — mapeo DB ↔ UI", () => {
  it("listTasks resuelve prioridad, estado, categoría e importe", async () => {
    vi.stubGlobal(
      "fetch",
      mockFetch({
        get: () => jsonResponse([dbTask({ prioridad: "alta", estado: "hecho", category_id: "c1", costo_previsto: 120, es_pago: true })]),
      }),
    );

    const [task] = await tasksRepository.listTasks();
    expect(task.priority).toBe("high");
    expect(task.done).toBe(true);
    expect(task.category).toEqual({ id: "c1", name: "Hogar", icon: "home", colorVar: "var(--cat-home)" });
    expect(task.amount).toBe(12000);
    expect(task.paymentId).toBe("t1");
  });

  it("getTask devuelve null cuando la API responde 404", async () => {
    vi.stubGlobal("fetch", mockFetch({ get: () => jsonResponse({ error: "no existe" }, 404) }));
    expect(await tasksRepository.getTask("inexistente")).toBeNull();
  });
});

describe("tasksRepository — completar y deshacer", () => {
  it("setTaskDone(true/false) traduce a estado 'hecho'/'pendiente'", async () => {
    const fetchMock = mockFetch({
      patch: (_url, body) => jsonResponse(dbTask({ estado: (body as { estado: string }).estado as DbTask["estado"] })),
    });
    vi.stubGlobal("fetch", fetchMock);

    const done = await tasksRepository.setTaskDone("t1", true);
    expect(done.done).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith("/api/tasks/t1", expect.objectContaining({ method: "PATCH", body: JSON.stringify({ estado: "hecho" }) }));

    const undone = await tasksRepository.setTaskDone("t1", false);
    expect(undone.done).toBe(false);
  });
});

describe("tasksRepository — posponer", () => {
  it("adelanta la fecha de vencimiento el número de días indicado", async () => {
    const fetchMock = mockFetch({
      get: () => jsonResponse(dbTask({ fecha_vencimiento: "2026-10-29" })),
      patch: (_url, body) => jsonResponse(dbTask({ fecha_vencimiento: (body as { fecha_vencimiento: string }).fecha_vencimiento })),
    });
    vi.stubGlobal("fetch", fetchMock);

    const updated = await tasksRepository.postpone("t4", 1);
    expect(updated.dueDate).toBe("2026-10-30");
  });
});

describe("tasksRepository — crear tarea", () => {
  it("envía user_id, prioridad en español y marca es_pago cuando hay importe", async () => {
    const fetchMock = mockFetch({
      post: (_url, body) => jsonResponse(dbTask({ titulo: (body as { titulo: string }).titulo, costo_previsto: 50, es_pago: true })),
    });
    vi.stubGlobal("fetch", fetchMock);

    const created = await tasksRepository.createTask({ title: "Nueva", priority: "high", amount: 5000 });
    expect(created.title).toBe("Nueva");
    expect(created.paymentId).toBe(created.id);

    const [, init] = fetchMock.mock.calls[0];
    const sentBody = JSON.parse((init as RequestInit).body as string);
    expect(sentBody).toMatchObject({ user_id: "u1", prioridad: "alta", es_pago: true, costo_previsto: 50 });
  });
});
