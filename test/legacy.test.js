const test = require("node:test");
const assert = require("node:assert/strict");
const { summarize, assigneeName, formatTicket, daysBetween } = require("../dist/legacy/report");
const { ticket } = require("./helpers");

const users = [{ id: 3, fullName: "Шевчук Олег", email: "o@k.ua", role: "admin" }];

test("legacy: summarize рахує заявки за станами", () => {
  const list = [ticket(), ticket({ id: 2 }), ticket({ id: 3, status: "closed" })];
  assert.deepEqual(summarize(list), { open: 2, closed: 1 });
});
test("legacy: assigneeName повертає ім'я великими літерами", () => {
  assert.equal(assigneeName(users, 3), "ШЕВЧУК ОЛЕГ");
});
test("legacy: assigneeName для відсутнього виконавця – «НЕ ПРИЗНАЧЕНО»", () => {
  assert.equal(assigneeName(users, null), "НЕ ПРИЗНАЧЕНО");
  assert.equal(assigneeName(users, 42), "НЕ ПРИЗНАЧЕНО");
});
test("legacy: formatTicket і daysBetween зберегли поведінку", () => {
  assert.equal(formatTicket(ticket({ description: "  HDMI " })), "#1 [high] Не працює проєктор: HDMI");
  assert.equal(formatTicket(ticket()), "#1 [high] Не працює проєктор");
  assert.equal(daysBetween("2026-09-01T00:00:00Z", "2026-09-03T12:00:00Z"), 2);
});
