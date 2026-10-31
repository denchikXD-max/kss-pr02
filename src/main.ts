import { readFileSync } from "node:fs";
import { join } from "node:path";
import { groupBy, paginate } from "./collections";
import { CreateTicketInput } from "./dto/create-ticket.input";
import type { Ticket } from "./models";
import { InMemoryRepository } from "./repository";
import { parseTickets, priorityWeight } from "./tickets";
import { validate } from "./validation";

const json = readFileSync(join(__dirname, "..", "data", "tickets.json"), "utf8");
const repo = new InMemoryRepository<Ticket>(parseTickets(json));

console.log(`Завантажено заявок: ${repo.count}\n`);

console.log("Відкриті заявки за спаданням пріоритету:");
repo
  .findAll({ status: "open" })
  .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority))
  .forEach((t) => console.log(`  #${t.id} [${t.priority}] ${t.title}`));

console.log("\nКількість заявок за станами:");
const byStatus = groupBy(repo.findAll(), (t) => t.status);
for (const [status, list] of Object.entries(byStatus)) {
  console.log(`  ${status}: ${list?.length ?? 0}`);
}

const page = paginate(repo.findAll(), 2, 4);
console.log(`\nСторінка ${page.page} з ${page.totalPages} (по ${page.pageSize}):`);
page.items.forEach((t) => console.log(`  #${t.id} ${t.title}`));

console.log("\nПеревірка некоректних даних:");
const bad = CreateTicketInput.from({ title: "", priority: "urgent", description: "x".repeat(501) });
validate(bad).forEach((message) => console.log(`  ${message}`));
