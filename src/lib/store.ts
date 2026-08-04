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
  addMenuItem: (m: Omit<MenuItem, "id">) => Promise<void>;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  setMenu: (menu: MenuItem[]) => void;
  setCategories: (categories: string[]) => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      auth: null,
      orders: [],
      menu: [],
      categories: [],
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
      setMenu: (menu) => set({ menu }),
      setCategories: (categories) => set({ categories }),
      addMenuItem: async (m) => {
        try {
          const res = await fetch("/api/menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(m),
          });
          if (res.ok) {
            const newItem = await res.json();
            set({ menu: [newItem, ...get().menu] });
          }
        } catch (e) {
          console.error("Store error adding menu item:", e);
        }
      },
      updateMenuItem: async (id, patch) => {
        try {
          const res = await fetch(`/api/menu/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          });
          if (res.ok) {
            const updated = await res.json();
            set({ menu: get().menu.map((m) => (m.id === id ? updated : m)) });
          }
        } catch (e) {
          console.error("Store error updating menu item:", e);
        }
      },
      deleteMenuItem: async (id) => {
        try {
          const res = await fetch(`/api/menu/${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            set({ menu: get().menu.filter((m) => m.id !== id) });
          }
        } catch (e) {
          console.error("Store error deleting menu item:", e);
        }
      },
      addCategory: async (name) => {
        const n = name.trim();
        if (!n || get().categories.includes(n)) return;
        try {
          const res = await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: n }),
          });
          if (res.ok) {
            const data = await res.json();
            set({ categories: [...get().categories, data.name] });
          }
        } catch (e) {
          console.error("Store error adding category:", e);
        }
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
