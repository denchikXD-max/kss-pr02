// Перевірки узагальнених типів (частина 2). Запуск: npm run typecheck:types
import { groupBy, paginate } from "../src/collections";
import type { Ticket, TicketStatus, User } from "../src/models";
import { InMemoryRepository } from "../src/repository";
import type { Result } from "../src/result";

const users = new InMemoryRepository<User>();

// @ts-expect-error – id призначає сховище
users.create({ id: 1, fullName: "Коваль Марія", email: "m@k.ua", role: "teacher" });
export const created: User = users.create({ fullName: "Коваль Марія", email: "m@k.ua", role: "teacher" });

// @ts-expect-error – у User немає поля status
users.findAll({ status: "open" });

const result: Result<User> = users.update(1, { fullName: "Коваль М. О." });
if (result.ok) {
  const user: User = result.value;
  void user;
} else {
  const message: string = result.error;
  void message;
}
// @ts-expect-error – без перевірки ok поле value недоступне
void result.value;

// @ts-expect-error – сховище приймає лише типи з числовим id
new InMemoryRepository<{ name: string }>();

const page = paginate(["a", "b", "c"], 1, 2);
export const firstLetter: string | undefined = page.items[0];
// @ts-expect-error – елементи сторінки мають тип string, а не number
export const wrongItem: number = page.items[0];

declare const tickets: Ticket[];
const byStatus = groupBy(tickets, (t) => t.status);
export const openTickets: Ticket[] | undefined = byStatus.open;
// @ts-expect-error – ключ групи має тип TicketStatus
void byStatus.unknown;
export const keys: TicketStatus[] = Object.keys(byStatus) as TicketStatus[];
