# Вимоги до практичної роботи № 2 «Основи TypeScript»

Предметна область – **служба технічної підтримки коледжу** (helpdesk): користувачі створюють заявки
(не працює проєктор, немає доступу до Wi-Fi), адміністратор призначає виконавця й змінює стан заявки.
Ця ж предметна область використовуватиметься для проєктування REST API в розділі 2.

Перевірка:

- `npm test` – компіляція `tsc` і запуск тестів поведінки (`test/*.test.js`, працюють зі скомпільованим кодом у `dist/`);
- `npm run typecheck:types` – перевірки на рівні типів (`typecheck/*.check.ts`);
- `npm run check` – обидві перевірки разом.

Файли в каталогах `test/` і `typecheck/` не змінюйте.

## Частина 1 (заняття 5)

### tsconfig.json
- Увімкнено `strict: true`; вихідний код у `src/`, результат компіляції – у `dist/`.
- Ціль компіляції – `es2022`, модулі – `nodenext`; підключено типи Node.js (`types: ["node"]`).
- Додатково: `noImplicitReturns`, `noFallthroughCasesInSwitch`.

### src/models.ts
- `TicketStatus` – `"open" | "in_progress" | "resolved" | "closed"`.
- `Priority` – `"low" | "medium" | "high" | "critical"`.
- `Role` – `"student" | "teacher" | "admin"`.
- `interface User` – `id` (лише для читання), `fullName`, `email`, `role`.
- `interface Ticket` – `id` (лише для читання), `title`, необов'язковий `description`, `status`, `priority`,
  `authorId`, `assigneeId` (число або `null`), `createdAt` (рядок ISO 8601), `tags` (масив рядків).
- `CreateTicketDto` – обов'язкові `title`, `priority`, `authorId`; необов'язкові `description`, `tags`;
  **без** `id`, `status`, `assigneeId`, `createdAt`.
- `UpdateTicketDto` – усі поля необов'язкові: `title`, `description`, `priority`, `assigneeId`, `tags`;
  **без** `id` і `status`.

### src/legacy/report.ts
- Після ввімкнення `strict` виправити всі помилки компіляції, використовуючи типи з `models.ts`.
- Поведінка функцій не змінюється, **крім** `assigneeName`: для відсутнього виконавця (`null` або
  невідомий `id`) повертається рядок `"НЕ ПРИЗНАЧЕНО"`.

### src/tickets.ts
- `STATUS_TRANSITIONS` – `Readonly<Record<TicketStatus, readonly TicketStatus[]>>`:
  `open → in_progress, closed`; `in_progress → open, resolved`; `resolved → closed, in_progress`; `closed →` (немає).
- `canTransition(from, to): boolean`.
- `changeStatus(ticket, to): Ticket` – повертає **новий** об'єкт; вихідний не змінюється.
  Для недопустимого переходу кидає `Error` з текстом `Недопустимий перехід: closed → open`.
- `priorityWeight(priority): number` – `low` 1, `medium` 2, `high` 3, `critical` 4; вичерпна перевірка через `never`.
- `isTicket(value: unknown): value is Ticket` – захисник типу, перевіряє всі поля (зокрема допустимі значення
  `status` і `priority`, непорожній `title`, коректну дату `createdAt`, масив рядків `tags`).
- `parseTickets(json: string): Ticket[]` – якщо JSON не масив, кидає `Error("Очікувався масив заявок")`;
  якщо елемент некоректний – `Error("Некоректна заявка з індексом N")`.

## Частина 2 (заняття 6)

### src/result.ts
- `type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E }`.
- Функції `ok(value)` і `err(error)`.

### src/repository.ts
- `interface Entity { readonly id: number }`.
- `class InMemoryRepository<T extends Entity>`:
  - `constructor(initial: readonly T[] = [])` – нумерація нових сутностей продовжується після найбільшого `id`;
  - `get count(): number`;
  - `create(data: Omit<T, "id">): T` – `id` призначає сховище (1, 2, 3 …);
  - `findById(id): T | undefined`;
  - `findAll(filter: Partial<T> = {}): T[]` – усі поля фільтра мають збігатися (`===`);
  - `update(id, patch: Partial<Omit<T, "id">>): Result<T>` – `id` не змінюється; для відсутньої сутності
    `{ ok: false, error: "Сутність з id=5 не знайдено" }`;
  - `remove(id): boolean`.
- Сховище повертає **копії** об'єктів: зміна результату ззовні не змінює збережені дані.

### src/collections.ts
- `interface Page<T> { items; page; pageSize; total; totalPages }`.
- `paginate<T>(items: readonly T[], page = 1, pageSize = 10): Page<T>` – сторінки нумеруються з 1;
  для нецілих або менших за 1 значень кидає `RangeError`.
- `groupBy<T, K extends PropertyKey>(items, keyOf): Partial<Record<K, T[]>>` – порядок у групах зберігається.

### src/validation.ts і src/dto/create-ticket.input.ts
- Декоратори властивостей (режим `experimentalDecorators`): `Required()`, `MaxLength(max)`, `IsIn(allowed)`.
- `validate(obj: object): string[]` – повідомлення у форматі `властивість: текст`:
  - `title: поле обов'язкове` (undefined, null або рядок із самих пробілів);
  - `title: довжина не більше 80 символів`;
  - `priority: допустимі значення: low, medium, high, critical`.
- Клас `CreateTicketInput`: `title` (обов'язкове, до 80), `description` (до 500), `priority` (обов'язкове, з
  переліку), `authorId` (обов'язкове); статичний метод `from(data)` створює екземпляр з об'єкта.
- Для об'єкта без декораторів `validate` повертає `[]`.

### src/main.ts
- Демонстраційний сценарій: завантажити `data/tickets.json` через `parseTickets`, вивести відкриті заявки за
  спаданням пріоритету, кількість за станами, другу сторінку списку, результат валідації некоректних даних.
  Запуск: `npm run build && npm start`.
