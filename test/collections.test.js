const test = require("node:test");
const assert = require("node:assert/strict");
const { paginate, groupBy } = require("../dist/collections");

const letters = ["a", "b", "c", "d", "e"];

test("collections: paginate повертає сторінку і метадані", () => {
  assert.deepEqual(paginate(letters, 2, 2), {
    items: ["c", "d"],
    page: 2,
    pageSize: 2,
    total: 5,
    totalPages: 3,
  });
  assert.deepEqual(paginate(letters).items, letters);
  assert.deepEqual(paginate(letters, 4, 2).items, []);
  assert.equal(paginate([], 1, 10).totalPages, 0);
});
test("collections: paginate кидає RangeError для некоректних параметрів", () => {
  assert.throws(() => paginate(letters, 0, 2), RangeError);
  assert.throws(() => paginate(letters, 1, 0), RangeError);
  assert.throws(() => paginate(letters, 1.5, 2), RangeError);
});
test("collections: groupBy групує зі збереженням порядку", () => {
  const words = ["кіт", "сом", "пес", "їжак", "лось"];
  assert.deepEqual(groupBy(words, (w) => w.length), { 3: ["кіт", "сом", "пес"], 4: ["їжак", "лось"] });
  assert.deepEqual(groupBy([], (x) => x), {});
});
