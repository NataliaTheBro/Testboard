const memo = {};

export const storage = {
  async get(key) {
    if (typeof window === "undefined") return { value: null };
    try {
      const value = window.localStorage.getItem(key);
      return { value };
    } catch {
      return { value: memo[key] ?? null };
    }
  },
  async set(key, value) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memo[key] = value;
    }
  },
};
