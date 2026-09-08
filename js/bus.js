export const bus = new EventTarget();

export function emit(type, detail = {}) {
  bus.dispatchEvent(new CustomEvent(type, { detail }));
}

export function on(type, fn) {
  bus.addEventListener(type, fn);
  return () => bus.removeEventListener(type, fn);
}
