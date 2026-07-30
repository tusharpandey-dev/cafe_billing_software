import type { MenuItem } from "./menuData";

export type OrderStatus = "pending" | "preparing" | "completed";

export type OrderItem = MenuItem & { quantity: number };

export type Order = {
  id: string;
  tableNumber: number;
  customerName: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
  waiter: string;
};

export const seedOrders: Order[] = [
  {
    id: "ORD-1042",
    tableNumber: 3,
    customerName: "Riya",
    notes: "Less spicy",
    items: [
      { id: "p4", name: "Cheese Burst Pizza", price: 299, category: "Pizzas", veg: true, description: "", emoji: "🍕", quantity: 1 },
      { id: "c4", name: "Cold Coffee", price: 119, category: "Hot & Cold Coffee", veg: true, description: "", emoji: "🧊", quantity: 2 },
    ],
    subtotal: 537,
    gst: 26.85,
    total: 563.85,
    status: "preparing",
    createdAt: Date.now() - 1000 * 60 * 12,
    waiter: "Marco",
  },
  {
    id: "ORD-1041",
    tableNumber: 7,
    customerName: "Aman",
    notes: "",
    items: [
      { id: "b4", name: "Chicken Burger", price: 169, category: "Burgers", veg: false, description: "", emoji: "🍔", quantity: 2 },
      { id: "f3", name: "Cheesy Fries", price: 149, category: "Fries", veg: true, description: "", emoji: "🍟", quantity: 1 },
    ],
    subtotal: 487,
    gst: 24.35,
    total: 511.35,
    status: "completed",
    createdAt: Date.now() - 1000 * 60 * 55,
    waiter: "Marco",
  },
  {
    id: "ORD-1040",
    tableNumber: 1,
    customerName: "Sneha",
    notes: "Extra cheese",
    items: [
      { id: "pa2", name: "White Sauce Pasta", price: 199, category: "Pastas", veg: true, description: "", emoji: "🍝", quantity: 1 },
      { id: "mo1", name: "Virgin Mojito", price: 99, category: "Mocktails", veg: true, description: "", emoji: "🍹", quantity: 2 },
    ],
    subtotal: 397,
    gst: 19.85,
    total: 416.85,
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 4,
    waiter: "Marco",
  },
];
