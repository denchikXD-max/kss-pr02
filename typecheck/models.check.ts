// Перевірки на рівні типів. Файл не виконується – його лише перевіряє компілятор:
//   npm run typecheck:types
// Директива @ts-expect-error вимагає, щоб наступний рядок містив помилку типу.
// Якщо ваші типи занадто «м'які» і помилки немає – компілятор повідомить
// "Unused '@ts-expect-error' directive".
import type { CreateTicketDto, Ticket, TicketStatus, UpdateTicketDto, User } from "../src/models";

export const status: TicketStatus = "in_progress";
// @ts-expect-error – стану "done" не існує
export const wrongStatus: TicketStatus = "done";

declare const ticket: Ticket;
// @ts-expect-error – id лише для читання
ticket.id = 5;
export const noAssignee: Ticket["assigneeId"] = null;
export const description: string | undefined = ticket.description;

export const created: CreateTicketDto = { title: "Не працює проєктор", priority: "high", authorId: 1 };
// @ts-expect-error – id призначає система, а не клієнт
export const createdWithId: CreateTicketDto = { id: 1, title: "x", priority: "low", authorId: 1 };
// @ts-expect-error – без обов'язкового authorId
export const createdNoAuthor: CreateTicketDto = { title: "x", priority: "low" };

export const emptyUpdate: UpdateTicketDto = {};
// @ts-expect-error – стан змінюється лише через changeStatus
export const statusUpdate: UpdateTicketDto = { status: "closed" };

// @ts-expect-error – роль "guest" не передбачена
export const guest: User = { id: 1, fullName: "Гість", email: "g@k.ua", role: "guest" };
