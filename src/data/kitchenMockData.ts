export type KitchenItem = {
  id: string;
  name: string;
  quantity: number;
  category: string;
  veg: boolean;
  emoji: string;
};

export type KitchenOrderStatus = "pending" | "preparing" | "completed";

export type KitchenOrder = {
  id: string;
  tableNumber: number;
  customerName: string;
  waiter: string;
  notes: string;
  status: KitchenOrderStatus;
  createdAt: number; // timestamp in ms
  items: KitchenItem[];
};

const now = Date.now();

export const initialKitchenOrders: KitchenOrder[] = [
  {
    id: "ORD-1045",
    tableNumber: 4,
    customerName: "Alex Rivera",
    waiter: "Marco",
    notes: "Extra spicy, no garlic in pasta!",
    status: "pending",
    createdAt: now - 3 * 60 * 1000, // 3 mins ago
    items: [
      { id: "ki-1", name: "Margherita Pizza", quantity: 2, category: "Pizzas", veg: true, emoji: "🍕" },
      { id: "ki-2", name: "Iced Caramel Macchiato", quantity: 1, category: "Beverages", veg: true, emoji: "🧋" },
      { id: "ki-3", name: "Garlic Breadsticks", quantity: 1, category: "Sides", veg: true, emoji: "🥖" },
    ],
  },
  {
    id: "ORD-1046",
    tableNumber: 2,
    customerName: "Sophia Chen",
    waiter: "Elena",
    notes: "Separate syrup for pancakes, allergic to nuts",
    status: "pending",
    createdAt: now - 14 * 60 * 1000, // 14 mins ago (RUSH ORDER)
    items: [
      { id: "ki-4", name: "Fluffy Berry Pancakes", quantity: 2, category: "Breakfast", veg: true, emoji: "🥞" },
      { id: "ki-5", name: "Double Espresso", quantity: 2, category: "Beverages", veg: true, emoji: "☕" },
    ],
  },
  {
    id: "ORD-1044",
    tableNumber: 7,
    customerName: "David Miller",
    waiter: "Marco",
    notes: "Medium rare patty for burger",
    status: "preparing",
    createdAt: now - 8 * 60 * 1000, // 8 mins ago
    items: [
      { id: "ki-6", name: "Smokey BBQ Chicken Burger", quantity: 2, category: "Burgers", veg: false, emoji: "🍔" },
      { id: "ki-7", name: "Crispy Peri-Peri Fries", quantity: 2, category: "Sides", veg: true, emoji: "🍟" },
      { id: "ki-8", name: "Classic Cold Coffee", quantity: 2, category: "Beverages", veg: true, emoji: "🥤" },
    ],
  },
  {
    id: "ORD-1043",
    tableNumber: 1,
    customerName: "Emily Watson",
    waiter: "Elena",
    notes: "",
    status: "preparing",
    createdAt: now - 6 * 60 * 1000, // 6 mins ago
    items: [
      { id: "ki-9", name: "Truffle Mushroom Risotto", quantity: 1, category: "Mains", veg: true, emoji: "🍲" },
      { id: "ki-10", name: "Sparkling Peach Mocktail", quantity: 1, category: "Beverages", veg: true, emoji: "🍹" },
    ],
  },
  {
    id: "ORD-1042",
    tableNumber: 5,
    customerName: "James Wilson",
    waiter: "Marco",
    notes: "Served with extra chocolate drizzle",
    status: "completed",
    createdAt: now - 25 * 60 * 1000, // 25 mins ago
    items: [
      { id: "ki-11", name: "Warm Fudgy Brownie", quantity: 2, category: "Desserts", veg: true, emoji: "🍫" },
      { id: "ki-12", name: "Vanilla Bean Latte", quantity: 2, category: "Beverages", veg: true, emoji: "☕" },
    ],
  },
  {
    id: "ORD-1041",
    tableNumber: 9,
    customerName: "Rachel Green",
    waiter: "Elena",
    notes: "",
    status: "completed",
    createdAt: now - 40 * 60 * 1000, // 40 mins ago
    items: [
      { id: "ki-13", name: "Creamy Alfredo Pasta", quantity: 1, category: "Pasta", veg: true, emoji: "🍝" },
      { id: "ki-14", name: "Fresh Caesar Salad", quantity: 1, category: "Salads", veg: false, emoji: "🥗" },
    ],
  },
];
