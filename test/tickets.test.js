const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canTransition,
  changeStatus,
  priorityWeight,
  isTicket,
  parseTickets,
} = require("../dist/tickets");
const { ticket } = require("./helpers");

test("tickets: canTransition за таблицею переходів", () => {
  assert.equal(canTransition("open", "in_progress"), true);
  assert.equal(canTransition("in_progress", "resolved"), true);
  assert.equal(canTransition("open", "resolved"), false);
  assert.equal(canTransition("closed", "open"), false);
});
test("tickets: changeStatus повертає новий об'єкт і не змінює вихідний", () => {
  const original = ticket();
  const moved = changeStatus(original, "in_progress");
  assert.equal(moved.status, "in_progress");
  assert.equal(original.status, "open");
  assert.notEqual(moved, original);
});
test("tickets: changeStatus кидає помилку для недопустимого переходу", () => {
  assert.throws(() => changeStatus(ticket({ status: "closed" }), "open"), {
    message: "Недопустимий перехід: closed → open",
  });
});
test("tickets: priorityWeight від low до critical", () => {
  assert.deepEqual(["low", "medium", "high", "critical"].map(priorityWeight), [1, 2, 3, 4]);
});
test("tickets: isTicket розпізнає коректну заявку", () => {
  assert.equal(isTicket(ticket()), true);
  assert.equal(isTicket(ticket({ description: "опис", assigneeId: 3, tags: ["мережа"] })), true);
});
test("tickets: isTicket відхиляє некоректні значення", () => {
  assert.equal(isTicket(null), false);
  assert.equal(isTicket([]), false);
  assert.equal(isTicket(ticket({ status: "done" })), false);
  assert.equal(isTicket(ticket({ priority: "urgent" })), false);
  assert.equal(isTicket(ticket({ id: "1" })), false);
  assert.equal(isTicket(ticket({ title: "   " })), false);
  assert.equal(isTicket(ticket({ tags: [1, 2] })), false);
  assert.equal(isTicket(ticket({ createdAt: "вчора" })), false);
});
test("tickets: parseTickets розбирає масив і повідомляє індекс помилки", () => {
  const json = JSON.stringify([ticket(), ticket({ id: 2 })]);
  assert.equal(parseTickets(json).length, 2);
  assert.throws(() => parseTickets('{"id":1}'), { message: "Очікувався масив заявок" });
  const bad = JSON.stringify([ticket(), { id: 2 }]);
  assert.throws(() => parseTickets(bad), { message: "Некоректна заявка з індексом 1" });
});
