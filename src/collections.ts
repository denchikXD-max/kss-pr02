export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginate<T>(items: readonly T[], page = 1, pageSize = 10): Page<T> {
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError(`page має бути цілим числом ≥ 1, отримано ${page}`);
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError(`pageSize має бути цілим числом ≥ 1, отримано ${pageSize}`);
  }
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyOf: (item: T) => K,
): Partial<Record<K, T[]>> {
  const result: Partial<Record<K, T[]>> = {};
  for (const item of items) {
    const key = keyOf(item);
    const group = result[key];
    if (group) {
      group.push(item);
    } else {
      result[key] = [item];
    }
  }
  return result;
}
