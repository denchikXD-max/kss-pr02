// Спільні тестові дані. Тести працюють із скомпільованим кодом у каталозі dist/.
function ticket(overrides = {}) {
  return {
    id: 1,
    title: "Не працює проєктор",
    status: "open",
    priority: "high",
    authorId: 2,
    assigneeId: null,
    createdAt: "2026-09-01T08:15:00Z",
    tags: [],
    ...overrides,
  };
}

module.exports = { ticket };
