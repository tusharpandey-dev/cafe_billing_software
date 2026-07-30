export const demoUsers = {
  admin: { email: "admin@cafemilano.com", password: "admin123", role: "admin" as const, name: "Admin" },
  waiter: { email: "waiter@cafemilano.com", password: "waiter123", role: "waiter" as const, name: "Marco" },
};

export type Role = "admin" | "waiter";
