// js/storage.js
export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key, defaultValue) {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : defaultValue;
} 