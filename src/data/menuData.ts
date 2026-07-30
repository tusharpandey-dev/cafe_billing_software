export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  veg: boolean;
  description: string;
  emoji: string;
};

export const categories = [
  "Pizzas",
  "Burgers",
  "Toast & Grill Sandwiches",
  "Sandwich",
  "Pastas",
  "Maggi",
  "Fries",
  "Nuggets",
  "Wraps",
  "Hot & Cold Coffee",
  "Cad-B",
  "Shakes",
  "Mocktails",
] as const;

export const menuItems: MenuItem[] = [
  // Pizzas
  { id: "p1", name: "Margherita Pizza", price: 199, category: "Pizzas", veg: true, description: "Classic tomato, mozzarella & basil", emoji: "🍕" },
  { id: "p2", name: "Farmhouse Pizza", price: 249, category: "Pizzas", veg: true, description: "Onion, capsicum, tomato, mushroom", emoji: "🍕" },
  { id: "p3", name: "Paneer Tikka Pizza", price: 279, category: "Pizzas", veg: true, description: "Spiced paneer, onion & capsicum", emoji: "🍕" },
  { id: "p4", name: "Cheese Burst Pizza", price: 299, category: "Pizzas", veg: true, description: "Loaded molten mozzarella", emoji: "🍕" },

  // Burgers
  { id: "b1", name: "Classic Veg Burger", price: 99, category: "Burgers", veg: true, description: "Crispy patty, lettuce & sauce", emoji: "🍔" },
  { id: "b2", name: "Cheese Burger", price: 129, category: "Burgers", veg: true, description: "Double cheese melt", emoji: "🍔" },
  { id: "b3", name: "Paneer Tikka Burger", price: 149, category: "Burgers", veg: true, description: "Tandoori paneer patty", emoji: "🍔" },
  { id: "b4", name: "Chicken Burger", price: 169, category: "Burgers", veg: false, description: "Juicy grilled chicken", emoji: "🍔" },

  // Toast & Grill Sandwiches
  { id: "t1", name: "Veg Grill Sandwich", price: 109, category: "Toast & Grill Sandwiches", veg: true, description: "Grilled veggies & cheese", emoji: "🥪" },
  { id: "t2", name: "Cheese Chilli Toast", price: 119, category: "Toast & Grill Sandwiches", veg: true, description: "Spicy cheese melt", emoji: "🥪" },
  { id: "t3", name: "Paneer Grill Toast", price: 139, category: "Toast & Grill Sandwiches", veg: true, description: "Stuffed paneer toast", emoji: "🥪" },

  // Sandwich
  { id: "s1", name: "Veg Sandwich", price: 79, category: "Sandwich", veg: true, description: "Fresh garden veggies", emoji: "🥪" },
  { id: "s2", name: "Club Sandwich", price: 149, category: "Sandwich", veg: true, description: "Triple decker classic", emoji: "🥪" },
  { id: "s3", name: "Corn & Cheese Sandwich", price: 119, category: "Sandwich", veg: true, description: "Sweet corn & mozzarella", emoji: "🥪" },

  // Pastas
  { id: "pa1", name: "Red Sauce Pasta", price: 179, category: "Pastas", veg: true, description: "Tangy tomato basil", emoji: "🍝" },
  { id: "pa2", name: "White Sauce Pasta", price: 199, category: "Pastas", veg: true, description: "Creamy alfredo", emoji: "🍝" },
  { id: "pa3", name: "Mixed Sauce Pasta", price: 219, category: "Pastas", veg: true, description: "Best of both sauces", emoji: "🍝" },

  // Maggi
  { id: "m1", name: "Plain Maggi", price: 69, category: "Maggi", veg: true, description: "Classic masala noodles", emoji: "🍜" },
  { id: "m2", name: "Cheese Maggi", price: 99, category: "Maggi", veg: true, description: "Loaded with cheese", emoji: "🍜" },
  { id: "m3", name: "Veg Maggi", price: 89, category: "Maggi", veg: true, description: "With mixed vegetables", emoji: "🍜" },

  // Fries
  { id: "f1", name: "Salted Fries", price: 99, category: "Fries", veg: true, description: "Crispy golden fries", emoji: "🍟" },
  { id: "f2", name: "Peri Peri Fries", price: 129, category: "Fries", veg: true, description: "Spicy peri peri seasoning", emoji: "🍟" },
  { id: "f3", name: "Cheesy Fries", price: 149, category: "Fries", veg: true, description: "Loaded with cheese sauce", emoji: "🍟" },

  // Nuggets
  { id: "n1", name: "Veg Nuggets", price: 119, category: "Nuggets", veg: true, description: "8 pcs crispy nuggets", emoji: "🍗" },
  { id: "n2", name: "Chicken Nuggets", price: 159, category: "Nuggets", veg: false, description: "8 pcs juicy chicken", emoji: "🍗" },

  // Wraps
  { id: "w1", name: "Paneer Wrap", price: 139, category: "Wraps", veg: true, description: "Spiced paneer roll", emoji: "🌯" },
  { id: "w2", name: "Veg Wrap", price: 119, category: "Wraps", veg: true, description: "Loaded fresh veggies", emoji: "🌯" },
  { id: "w3", name: "Chicken Wrap", price: 169, category: "Wraps", veg: false, description: "Grilled chicken roll", emoji: "🌯" },

  // Hot & Cold Coffee
  { id: "c1", name: "Cappuccino", price: 89, category: "Hot & Cold Coffee", veg: true, description: "Italian classic", emoji: "☕" },
  { id: "c2", name: "Espresso", price: 79, category: "Hot & Cold Coffee", veg: true, description: "Strong & bold", emoji: "☕" },
  { id: "c3", name: "Latte", price: 99, category: "Hot & Cold Coffee", veg: true, description: "Smooth milk coffee", emoji: "☕" },
  { id: "c4", name: "Cold Coffee", price: 119, category: "Hot & Cold Coffee", veg: true, description: "Iced & creamy", emoji: "🧊" },
  { id: "c5", name: "Mocha", price: 129, category: "Hot & Cold Coffee", veg: true, description: "Chocolate & coffee", emoji: "☕" },

  // Cad-B
  { id: "cb1", name: "Cadbury Shake", price: 139, category: "Cad-B", veg: true, description: "Rich chocolate blend", emoji: "🍫" },
  { id: "cb2", name: "Cadbury Brownie", price: 119, category: "Cad-B", veg: true, description: "Warm gooey brownie", emoji: "🍫" },

  // Shakes
  { id: "sh1", name: "Vanilla Shake", price: 109, category: "Shakes", veg: true, description: "Creamy vanilla", emoji: "🥤" },
  { id: "sh2", name: "Chocolate Shake", price: 129, category: "Shakes", veg: true, description: "Rich choco bliss", emoji: "🥤" },
  { id: "sh3", name: "Strawberry Shake", price: 129, category: "Shakes", veg: true, description: "Fresh strawberry", emoji: "🥤" },
  { id: "sh4", name: "Oreo Shake", price: 149, category: "Shakes", veg: true, description: "Loaded with oreo", emoji: "🥤" },

  // Mocktails
  { id: "mo1", name: "Virgin Mojito", price: 99, category: "Mocktails", veg: true, description: "Mint, lime & soda", emoji: "🍹" },
  { id: "mo2", name: "Blue Lagoon", price: 119, category: "Mocktails", veg: true, description: "Refreshing blue mix", emoji: "🍹" },
  { id: "mo3", name: "Fruit Punch", price: 109, category: "Mocktails", veg: true, description: "Tropical fruit blend", emoji: "🍹" },
];
