type NestedValue = string | { [key: string]: NestedValue };

export function getNestedValue(
  obj: NestedValue,
  path: string,
): string | undefined {
  const keys = path.split(".");
  let current: NestedValue = obj;

  for (const key of keys) {
    if (typeof current !== "object" || current === null || !(key in current)) {
      return undefined;
    }
    current = current[key];
  }

  return typeof current === "string" ? current : undefined;
}
