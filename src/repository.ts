import { err, ok, type Result } from "./result";

export interface Entity {
  readonly id: number;
}

// Усі методи працюють із глибокими копіями (structuredClone), щоб зміна результату
// або переданого об'єкта (зокрема масиву tags) ззовні не псувала збережені дані.
export class InMemoryRepository<T extends Entity> {
  private items: T[] = [];
  private nextId = 1;

  constructor(initial: readonly T[] = []) {
    this.items = initial.map((item) => structuredClone(item));
    this.nextId = initial.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  get count(): number {
    return this.items.length;
  }

  create(data: Omit<T, "id">): T {
    // Обґрунтоване приведення: TypeScript не може довести, що Omit<T, "id"> & { id: number }
    // сумісний із довільним T, хоча за обмеженням T extends Entity це так.
    const item = { ...structuredClone(data), id: this.nextId++ } as T;
    this.items.push(item);
    return structuredClone(item);
  }

  findById(id: number): T | undefined {
    const item = this.items.find((i) => i.id === id);
    return item === undefined ? undefined : structuredClone(item);
  }

  findAll(filter: Partial<T> = {}): T[] {
    return this.items
      .filter((item) => {
        for (const key in filter) {
          const expected = filter[key];
          if (expected !== undefined && item[key] !== expected) return false;
        }
        return true;
      })
      .map((item) => structuredClone(item));
  }

  update(id: number, patch: Partial<Omit<T, "id">>): Result<T> {
    const index = this.items.findIndex((i) => i.id === id);
    const current = this.items[index];
    if (current === undefined) {
      return err(`Сутність з id=${id} не знайдено`);
    }
    // id іде останнім, тому навіть якщо він є в patch, його буде перезаписано.
    const updated: T = { ...current, ...structuredClone(patch), id: current.id };
    this.items[index] = updated;
    return ok(structuredClone(updated));
  }

  remove(id: number): boolean {
    const index = this.items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}
