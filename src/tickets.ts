import type { Priority, Ticket, TicketStatus } from "./models";

export const STATUS_TRANSITIONS: Readonly<Record<TicketStatus, readonly TicketStatus[]>> = {
  open: ["in_progress", "closed"],
  in_progress: ["open", "resolved"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

const STATUSES: readonly TicketStatus[] = ["open", "in_progress", "resolved", "closed"];
const PRIORITIES: readonly Priority[] = ["low", "medium", "high", "critical"];

export function assertNever(value: never): never {
  throw new Error(`Неочікуване значення: ${String(value)}`);
}

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return STATUS_TRANSITIONS[from].includes(to);
}

export function changeStatus(ticket: Ticket, to: TicketStatus): Ticket {
  if (!canTransition(ticket.status, to)) {
    throw new Error(`Недопустимий перехід: ${ticket.status} → ${to}`);
  }
  return { ...ticket, status: to };
}

export function priorityWeight(priority: Priority): number {
  switch (priority) {
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
    case "critical":
      return 4;
    default:
      return assertNever(priority);
  }
}

function isStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && STATUSES.some((s) => s === value);
}

function isPriority(value: unknown): value is Priority {
  return typeof value === "string" && PRIORITIES.some((p) => p === value);
}

export function isTicket(value: unknown): value is Ticket {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;

  if (!("id" in value) || typeof value.id !== "number") return false;
  if (!("title" in value) || typeof value.title !== "string" || value.title.trim() === "") return false;
  if (!("status" in value) || !isStatus(value.status)) return false;
  if (!("priority" in value) || !isPriority(value.priority)) return false;
  if (!("authorId" in value) || typeof value.authorId !== "number") return false;
  if (!("assigneeId" in value) || (value.assigneeId !== null && typeof value.assigneeId !== "number")) {
    return false;
  }
  if (!("createdAt" in value) || typeof value.createdAt !== "string" || Number.isNaN(Date.parse(value.createdAt))) {
    return false;
  }
  if (!("tags" in value) || !Array.isArray(value.tags) || !value.tags.every((t: unknown) => typeof t === "string")) {
    return false;
  }
  if ("description" in value && value.description !== undefined && typeof value.description !== "string") {
    return false;
  }
  return true;
}

export function parseTickets(json: string): Ticket[] {
  const data: unknown = JSON.parse(json);
  if (!Array.isArray(data)) {
    throw new Error("Очікувався масив заявок");
  }
  const items: unknown[] = data;
  const result: Ticket[] = [];
  items.forEach((item, index) => {
    if (!isTicket(item)) {
      throw new Error(`Некоректна заявка з індексом ${index}`);
    }
    result.push(item);
  });
  return result;
}

// Додаткове завдання 2: з noUncheckedIndexedAccess `tickets[0]` має тип Ticket | undefined.
export function firstTitle(tickets: Ticket[]): string {
  return tickets[0]?.title ?? "";
}
