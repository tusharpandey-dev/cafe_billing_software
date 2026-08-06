import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus, OrderItem } from "@/data/ordersData";
import { seedOrders } from "@/data/ordersData";
import { menuItems as seedMenu, categories as seedCats, type MenuItem } from "@/data/menuData";
import type { Role } from "@/data/usersData";

export const GST_RATE = 0.05;

export type Table = { id: string; number: number; capacity: number };

type Auth = { role: Role; name: string; email: string } | null;

type State = {
  auth: Auth;
  orders: Order[];
  menu: MenuItem[];
  categories: string[];
  tables: Table[];
  login: (auth: Auth) => void;
  logout: () => void;
  addOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Promise<Order>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  payOrder: (id: string, paymentDetails: { paymentId: string; paymentOrderId: string; paymentSignature: string }) => Promise<void>;
  addMenuItem: (m: Omit<MenuItem, "id">) => Promise<void>;
  updateMenuItem: (id: string, patch: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  setMenu: (menu: MenuItem[]) => void;
  setCategories: (categories: string[]) => void;
  setOrders: (orders: Order[]) => void;
  setTables: (tables: Table[]) => void;
  addTable: (t: Omit<Table, "id">) => Promise<Table>;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      auth: null,
      orders: [],
      menu: [],
      categories: [],
      tables: [],
      login: (auth) => set({ auth }),
      logout: () => set({ auth: null }),
      setOrders: (orders) => set({ orders }),
      setTables: (tables) => set({ tables }),
      addTable: async (t) => {
        try {
          const res = await fetch("/api/tables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(t),
          });
          if (res.ok) {
            const table = await res.json();
            const updatedTables = [...get().tables, table].sort((a, b) => a.number - b.number);
            set({ tables: updatedTables });
            return table;
          }
        } catch (e) {
          console.error("Store error adding table:", e);
        }
        const fallbackId = `TBL-${100 + get().tables.length}`;
        const table: Table = { ...t, id: fallbackId };
        const updatedTables = [...get().tables, table].sort((a, b) => a.number - b.number);
        set({ tables: updatedTables });
        return table;
      },
      addOrder: async (o) => {
        try {
          const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(o),
          });
          if (res.ok) {
            const order = await res.json();
            set({ orders: [order, ...get().orders] });
            return order;
          }
        } catch (e) {
          console.error("Store error adding order:", e);
        }
        // Fallback in case of API failure
        const id = `ORD-${1043 + get().orders.filter((x) => x.id.startsWith("ORD-")).length}`;
        const order: Order = { ...o, id, createdAt: Date.now(), status: "pending" };
        set({ orders: [order, ...get().orders] });
        return order;
      },
      updateStatus: async (id, status) => {
        try {
          const res = await fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
          if (res.ok) {
            set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) });
          }
        } catch (e) {
          console.error("Store error updating order status:", e);
        }
      },
      payOrder: async (id, paymentDetails) => {
        try {
          const res = await fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentStatus: "paid",
              ...paymentDetails,
            }),
          });
          if (res.ok) {
            set({
              orders: get().orders.map((o) =>
                o.id === id
                  ? {
                      ...o,
                      paymentStatus: "paid",
                      ...paymentDetails,
                    }
                  : o
              ),
            });
          }
        } catch (e) {
          console.error("Store error updating payment status:", e);
        }
      },
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
