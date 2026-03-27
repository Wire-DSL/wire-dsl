/**
 * Normalizes a property value that may be a CSV string or already an array
 * into a string[]. This is the single source of truth for list coercion.
 */
export function toStringArray(value: string | number | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === '') return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
