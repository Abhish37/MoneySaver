/**
 * lib/utils/storage.ts
 * Centralised, safe localStorage helpers.
 * Replaces the scattered try/catch pattern used 10+ times across the codebase.
 */

export function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Silently swallow quota / private-browsing errors
  }
}
