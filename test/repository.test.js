const test = require("node:test");
const assert = require("node:assert/strict");
const { InMemoryRepository } = require("../dist/repository");
const { ok, err } = require("../dist/result");
const { ticket } = require("./helpers");

test("result: ok і err створюють розмічене об'єднання", () => {
  assert.deepEqual(ok(5), { ok: true, value: 5 });
  assert.deepEqual(err("помилка"), { ok: false, error: "помилка" });
});
test("repository: create призначає id послідовно", () => {
  const repo = new InMemoryRepository();
  const a = repo.create({ name: "A" });
  const b = repo.create({ name: "B" });
  assert.deepEqual([a.id, b.id], [1, 2]);
  assert.equal(repo.count, 2);
});
test("repository: початкові дані і продовження нумерації", () => {
  const repo = new InMemoryRepository([ticket({ id: 7 }), ticket({ id: 3 })]);
  assert.equal(repo.create({ name: "X" }).id, 8);
});
test("repository: findById і findAll з фільтром", () => {
  const repo = new InMemoryRepository([
    ticket({ id: 1 }),
    ticket({ id: 2, status: "closed" }),
    ticket({ id: 3, priority: "low" }),
  ]);
  assert.equal(repo.findById(2).status, "closed");
  assert.equal(repo.findById(99), undefined);
  assert.deepEqual(repo.findAll({ status: "open" }).map((t) => t.id), [1, 3]);
  assert.deepEqual(repo.findAll({ status: "open", priority: "low" }).map((t) => t.id), [3]);
  assert.equal(repo.findAll().length, 3);
});
test("repository: зовнішні зміни не псують сховище", () => {
  const repo = new InMemoryRepository([ticket()]);
  repo.findById(1).title = "змінено ззовні";
  assert.equal(repo.findById(1).title, "Не працює проєктор");
});
test("repository: update повертає Result і не змінює id", () => {
  const repo = new InMemoryRepository([ticket()]);
  const res = repo.update(1, { priority: "low", id: 100 });
  assert.equal(res.ok, true);
  assert.equal(res.value.priority, "low");
  assert.equal(res.value.id, 1);
  assert.deepEqual(repo.update(5, { title: "?" }), { ok: false, error: "Сутність з id=5 не знайдено" });
});
test("repository: remove", () => {
  const repo = new InMemoryRepository([ticket()]);
  assert.equal(repo.remove(1), true);
  assert.equal(repo.remove(1), false);
  assert.equal(repo.count, 0);
});
