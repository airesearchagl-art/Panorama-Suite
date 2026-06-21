export const projectHandoffStorageKey = 'panorama-suite:handoff:project';
export const updatedProjectHandoffStorageKey = 'panorama-suite:handoff:updated-project';

export function saveUpdatedProjectHandoff(data: unknown) {
  sessionStorage.setItem(updatedProjectHandoffStorageKey, JSON.stringify(data));
}

export function loadUpdatedProjectHandoff<T = unknown>(): T | null {
  const raw = sessionStorage.getItem(updatedProjectHandoffStorageKey);
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

export function clearUpdatedProjectHandoff() {
  sessionStorage.removeItem(updatedProjectHandoffStorageKey);
}
