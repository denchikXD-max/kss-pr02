export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type Priority = "low" | "medium" | "high" | "critical";
export type Role = "student" | "teacher" | "admin";

export interface User {
  readonly id: number;
  fullName: string;
  email: string;
  role: Role;
}

export interface Ticket {
  readonly id: number;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: Priority;
  authorId: number;
  assigneeId: number | null;
  createdAt: string; // ISO 8601
  tags: string[];
}

// DTO створення: обов'язкові title, priority, authorId; необов'язкові description, tags.
export type CreateTicketDto =
  Pick<Ticket, "title" | "priority" | "authorId"> &
  Partial<Pick<Ticket, "description" | "tags">>;

// DTO оновлення: усі поля необов'язкові, але без id і status
// (стан змінюється лише через changeStatus; автор і дата створення теж незмінні).
export type UpdateTicketDto =
  Partial<Pick<Ticket, "title" | "description" | "priority" | "assigneeId" | "tags">>;
