export type Rule = (value: unknown) => string | null;

const registry = new WeakMap<object, Map<string, Rule[]>>();

function addRule(target: object, propertyKey: string | symbol, rule: Rule): void {
  const field = String(propertyKey);
  let fields = registry.get(target);
  if (!fields) {
    fields = new Map<string, Rule[]>();
    registry.set(target, fields);
  }
  const rules = fields.get(field) ?? [];
  // Декоратори виконуються знизу вгору; unshift повертає порядок, у якому їх записано в коді.
  rules.unshift(rule);
  fields.set(field, rules);
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null;
}

export function Required(): PropertyDecorator {
  return (target, propertyKey) =>
    addRule(target, propertyKey, (value) =>
      value === undefined || value === null || (typeof value === "string" && value.trim() === "")
        ? "поле обов'язкове"
        : null,
    );
}

export function MaxLength(max: number): PropertyDecorator {
  return (target, propertyKey) =>
    addRule(target, propertyKey, (value) => {
      if (isEmpty(value)) return null;
      if (typeof value !== "string") return "значення має бути рядком";
      return value.length > max ? `довжина не більше ${max} символів` : null;
    });
}

export function IsIn(allowed: readonly unknown[]): PropertyDecorator {
  return (target, propertyKey) =>
    addRule(target, propertyKey, (value) => {
      if (isEmpty(value)) return null;
      return allowed.includes(value) ? null : `допустимі значення: ${allowed.join(", ")}`;
    });
}

// Повертає повідомлення у форматі «властивість: текст»; для коректного об'єкта — [].
export function validate(obj: object): string[] {
  const errors: string[] = [];
  // Правила зареєстровано на прототипі класу (і прототипах батьківських класів).
  let proto: object | null = Object.getPrototypeOf(obj);
  while (proto !== null) {
    const fields = registry.get(proto);
    if (fields) {
      for (const [field, rules] of fields) {
        const value: unknown = Reflect.get(obj, field);
        for (const rule of rules) {
          const message = rule(value);
          if (message !== null) errors.push(`${field}: ${message}`);
        }
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return errors;
}
