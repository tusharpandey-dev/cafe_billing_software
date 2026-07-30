import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus, OrderItem } from "@/data/ordersData";
import { seedOrders } from "@/data/ordersData";
import { menuItems as seedMenu, categories as seedCats, type MenuItem } from "@/data/menuData";
import type { Role } from "@/data/usersData";

export const GST_RATE = 0.05;

type Auth = { role: Role; name: string; email: string } | null;

type State = {
  auth: Auth;
  orders: Order[];
  menu: MenuItem[];
  categories: string[];
  login: (auth: Auth) => void;
  logout: () => void;
  addOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Order;
  updateStatus: (id: string, status: OrderStatus) => void;
  addMenuItem: (m: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (name: string) => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      auth: null,
      orders: seedOrders,
      menu: seedMenu,
      categories: [...seedCats],
      login: (auth) => set({ auth }),
      logout: () => set({ auth: null }),
      addOrder: (o) => {
        const id = `ORD-${1043 + get().orders.filter((x) => x.id.startsWith("ORD-")).length}`;
        const order: Order = { ...o, id, createdAt: Date.now(), status: "pending" };
        set({ orders: [order, ...get().orders] });
        return order;
      },
      updateStatus: (id, status) =>
        set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) }),
      addMenuItem: (m) => {
        const id = `mi-${Date.now()}`;
        set({ menu: [{ ...m, id }, ...get().menu] });
      },
      updateMenuItem: (id, patch) =>
        set({ menu: get().menu.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),
      deleteMenuItem: (id) => set({ menu: get().menu.filter((m) => m.id !== id) }),
      addCategory: (name) => {
        const n = name.trim();
        if (!n || get().categories.includes(n)) return;
        set({ categories: [...get().categories, n] });
      },
    }),
    { name: "cafe-milano-store", version: 2 }
  )
);

export function calcTotals(items: OrderItem[]) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst = +(subtotal * GST_RATE).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);
  return { subtotal, gst, total };
}

export type { MenuItem };
