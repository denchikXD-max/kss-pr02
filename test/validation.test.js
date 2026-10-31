const test = require("node:test");
const assert = require("node:assert/strict");
const { CreateTicketInput } = require("../dist/dto/create-ticket.input");
const { validate } = require("../dist/validation");

test("validation: коректні дані – без помилок", () => {
  const input = CreateTicketInput.from({ title: "Не працює Wi-Fi", priority: "medium", authorId: 1 });
  assert.deepEqual(validate(input), []);
});
test("validation: Required для порожніх і відсутніх полів", () => {
  const errors = validate(CreateTicketInput.from({ title: "  " }));
  assert.ok(errors.includes("title: поле обов'язкове"));
  assert.ok(errors.includes("priority: поле обов'язкове"));
  assert.ok(errors.includes("authorId: поле обов'язкове"));
});
test("validation: MaxLength та IsIn", () => {
  const errors = validate(
    CreateTicketInput.from({ title: "x".repeat(81), priority: "urgent", authorId: 1 }),
  );
  assert.deepEqual(errors, [
    "title: довжина не більше 80 символів",
    "priority: допустимі значення: low, medium, high, critical",
  ]);
  const long = validate(
    CreateTicketInput.from({ title: "ok", priority: "low", authorId: 1, description: "y".repeat(501) }),
  );
  assert.deepEqual(long, ["description: довжина не більше 500 символів"]);
});
test("validation: об'єкт без декораторів вважається коректним", () => {
  assert.deepEqual(validate({ any: "value" }), []);
});
