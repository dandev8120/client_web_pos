/**
 * Reusable helper to clean search/request payloads before sending to backend APIs.
 * Removes undefined, null, empty strings (""), whitespace-only strings ("   "), and empty arrays ([]).
 * Preserves 0, false, "0", valid non-empty numbers, booleans, strings, and objects.
 */
export function cleanPayload<T extends Record<string, unknown>>(
  payload: T
): Partial<T> {
  if (!payload || typeof payload !== 'object') {
    return {} as Partial<T>;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }

      if (Array.isArray(value) && value.length === 0) {
        return false;
      }

      return true;
    })
  ) as Partial<T>;
}
