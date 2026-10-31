// Декоратор методу (experimentalDecorators): обгортає метод і виводить
// ім'я, аргументи та тривалість виконання в мілісекундах.
export function LogCall(): MethodDecorator {
  return (_target, propertyKey, descriptor) => {
    const original: unknown = descriptor.value;
    if (typeof original !== "function") {
      throw new TypeError(`@LogCall можна застосувати лише до методу, а не до "${String(propertyKey)}"`);
    }
    // Обґрунтоване приведення: тип value — довільний T методу, а обгортка зберігає його сигнатуру.
    descriptor.value = function (this: unknown, ...args: unknown[]) {
      const start = performance.now();
      try {
        return Reflect.apply(original, this, args);
      } finally {
        const ms = (performance.now() - start).toFixed(3);
        console.log(`[LogCall] ${String(propertyKey)}(${JSON.stringify(args)}) — ${ms} мс`);
      }
    } as typeof descriptor.value;
    return descriptor;
  };
}
