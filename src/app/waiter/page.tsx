"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, Send, Search, Leaf, Drumstick, CheckCircle2 } from "lucide-react";
import type { MenuItem } from "@/data/menuData";
import { calcTotals, useStore } from "@/lib/store";
import type { OrderItem } from "@/data/ordersData";
import { ReceiptCard } from "@/components/ReceiptCard";

export default function WaiterPOS() {
  const { addOrder, auth, menu: menuItems, categories, tables, addTable } = useStore();
  const [activeCat, setActiveCat] = useState<string>(categories[0] ?? "");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [placed, setPlaced] = useState<null | ReturnType<typeof useStore.getState>["orders"][number]>(null);

  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("4");

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNumber);
    const cap = parseInt(newTableCapacity);
    if (!num || num <= 0 || !cap || cap <= 0) {
      alert("Please enter valid positive numbers.");
      return;
    }
    if (tables.some((t) => t.number === num)) {
      alert(`Table #${num} already exists.`);
      return;
    }
    try {
      const newT = await addTable({ number: num, capacity: cap });
      setTableNumber(newT.number);
      setShowAddTable(false);
      setNewTableNumber("");
      setNewTableCapacity("4");
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = useMemo(
    () =>
      menuItems.filter((m) =>
        search ? m.name.toLowerCase().includes(search.toLowerCase()) : m.category === activeCat
      ),
    [activeCat, search, menuItems]
  );

  const add = (m: MenuItem) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.id === m.id);
      return ex
        ? prev.map((i) => (i.id === m.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...m, quantity: 1 }];
    });
  };
  const dec = (id: string) =>
    setItems((prev) =>
      prev.flatMap((i) => (i.id === id ? (i.quantity > 1 ? [{ ...i, quantity: i.quantity - 1 }] : []) : [i]))
    );
  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const totals = calcTotals(items);

  const place = async () => {
    if (!items.length) return;

    try {
      const order = await addOrder({
        tableNumber,
        customerName: customerName || "Guest",
        notes,
        items,
        ...totals,
        waiter: auth?.name ?? "Waiter",
        paymentId: "",
        paymentOrderId: "",
        paymentSignature: "",
        paymentStatus: "pending",
      });
      setPlaced(order);
      setItems([]);
      setCustomerName("");
      setNotes("");
    } catch (err) {
      console.error("Place order error:", err);
      alert("An unexpected error occurred while placing the order.");
    }
  };

  if (placed) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto mb-3"
          >
            <CheckCircle2 className="w-8 h-8" />
          </motion.div>
          <h2 className="text-2xl font-display font-bold">Order placed!</h2>
          <p className="text-muted-foreground text-sm">Sent to kitchen · {placed.id}</p>
        </div>
        <ReceiptCard order={placed} />
        <button
          onClick={() => setPlaced(null)}
          className="w-full mt-6 bg-gradient-gold text-gold-foreground rounded-xl py-3 font-semibold shadow-gold"
        >
          New Order
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_400px] gap-4 lg:gap-6 min-w-0">
      {/* Menu */}
      <div className="min-w-0">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold">New Order</h1>
            <p className="text-sm text-muted-foreground">Tap items to add to cart</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu…"
              className="bg-input/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm w-56 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {!search && (
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-2 px-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCat === c
                    ? "bg-gradient-gold text-gold-foreground shadow-gold"
                    : "glass text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((m) => (
              <motion.button
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => add(m)}
                className="glass rounded-2xl p-4 text-left hover:gold-border transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{m.emoji}</div>
                  {m.veg ? (
                    <Leaf className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Drumstick className="w-3.5 h-3.5 text-destructive" />
                  )}
                </div>
                <p className="font-semibold mt-2 text-sm">{m.name}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{m.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-display font-bold gold-text">₹{m.price}</span>
                  <span className="w-7 h-7 rounded-full bg-gradient-gold text-gold-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </span>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Cart */}
      <div className="lg:sticky lg:top-6 lg:self-start glass-strong rounded-2xl p-5 shadow-elegant">
        <h2 className="font-display text-xl font-bold">Current Order</h2>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Table</label>
              <button
                type="button"
                onClick={() => setShowAddTable(!showAddTable)}
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(Number(e.target.value))}
              className="w-full bg-input/50 border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-primary"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.number}>Table {t.number} ({t.capacity}p)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Customer</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              className="w-full bg-input/50 border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {showAddTable && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddTable}
            className="mt-3 p-3 glass rounded-xl border border-primary/20 space-y-2.5"
          >
            <p className="text-xs font-semibold text-primary">Add New Table</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Table #</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g. 13"
                  className="w-full bg-input/40 border border-border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Capacity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full bg-input/40 border border-border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowAddTable(false)}
                className="px-3 py-1 rounded bg-muted/50 text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-gradient-gold text-gold-foreground font-semibold"
              >
                Add Table
              </button>
            </div>
          </motion.form>
        )}

        <div className="mt-4 max-h-[40vh] overflow-y-auto pr-1 space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Cart is empty.<br />Add items from the menu.</p>
          )}
          <AnimatePresence>
            {items.map((it) => (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 glass rounded-xl p-2.5"
              >
                <div className="text-xl">{it.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{it.name}</p>
                  <p className="text-xs text-muted-foreground">₹{it.price} × {it.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => dec(it.id)} className="w-7 h-7 rounded-md bg-card flex items-center justify-center hover:bg-secondary">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{it.quantity}</span>
                  <button onClick={() => add(it)} className="w-7 h-7 rounded-md bg-card flex items-center justify-center hover:bg-secondary">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => remove(it.id)} className="w-7 h-7 rounded-md text-destructive hover:bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Special notes (optional)…"
          rows={2}
          className="w-full bg-input/50 border border-border rounded-lg px-3 py-2 text-sm mt-3 focus:outline-none focus:border-primary resize-none"
        />

        <div className="mt-4 space-y-1.5 text-sm border-t border-border/40 pt-3">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{totals.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>GST (5%)</span><span>₹{totals.gst.toFixed(2)}</span></div>
          <div className="flex justify-between font-display font-bold text-xl mt-2"><span>Total</span><span className="gold-text">₹{totals.total.toFixed(2)}</span></div>
        </div>

        <button
          onClick={place}
          disabled={!items.length}
          className="w-full mt-4 bg-gradient-gold text-gold-foreground rounded-xl py-3 font-semibold shadow-gold flex items-center justify-center gap-2 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed hover:scale-[1.01] transition-transform"
        >
          <Send className="w-4 h-4" /> Place Order
        </button>
      </div>
    </div>
  );
}
