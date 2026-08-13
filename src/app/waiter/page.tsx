"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, Send, Search, Leaf, Drumstick, CheckCircle2 } from "lucide-react";
import type { MenuItem } from "@/data/menuData";
import { calcTotals, useStore } from "@/lib/store";
import type { OrderItem } from "@/data/ordersData";
import { ReceiptCard } from "@/components/ReceiptCard";

export default function WaiterPOS() {
  const router = useRouter();
  const { addOrder, updateOrderItems, orders, auth, menu: menuItems, categories, tables, addTable } = useStore();

  useEffect(() => {
    const devId = localStorage.getItem("waiter_device_id");
    if (!devId) {
      router.push("/waiter/setup");
      return;
    }
    if (auth?.mustChangePassword) {
      router.push("/waiter/change-password");
      return;
    }
  }, [auth, router]);
  const [activeCat, setActiveCat] = useState<string>(categories[0] ?? "");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [placed, setPlaced] = useState<null | ReturnType<typeof useStore.getState>["orders"][number]>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const activeOrderForTable = useMemo(() => {
    return orders.find(
      (o) =>
        o.tableNumber === tableNumber &&
        o.paymentStatus === "pending" &&
        o.status !== "completed"
    );
  }, [orders, tableNumber]);

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
        m.category === "Quick Add"
          ? false
          : search
          ? m.name.toLowerCase().includes(search.toLowerCase())
          : m.category === activeCat
      ),
    [activeCat, search, menuItems]
  );

  const waterBottleItem = useMemo(() => menuItems.find((m) => m.name === "Water Bottle"), [menuItems]);
  const coldDrinksItem = useMemo(() => menuItems.find((m) => m.name === "Cold Drinks"), [menuItems]);

  const add = (m: MenuItem, portion: "half" | "full" = "full") => {
    setItems((prev) => {
      const ex = prev.find((i) => i.id === m.id && i.portion === portion);
      const itemPrice = portion === "half" && m.halfPrice ? m.halfPrice : m.price;
      return ex
        ? prev.map((i) => (i.id === m.id && i.portion === portion ? { ...i, quantity: i.quantity + 1 } : i))
        : [...prev, { ...m, price: itemPrice, portion, quantity: 1 }];
    });
  };
  const dec = (id: string, portion: "half" | "full" = "full") =>
    setItems((prev) =>
      prev.flatMap((i) => (i.id === id && i.portion === portion ? (i.quantity > 1 ? [{ ...i, quantity: i.quantity - 1 }] : []) : [i]))
    );
  const remove = (id: string, portion: "half" | "full" = "full") =>
    setItems((prev) => prev.filter((i) => !(i.id === id && i.portion === portion)));

  const totals = calcTotals(items);

  const place = async () => {
    if (!items.length) return;

    try {
      if (activeOrderForTable && !editingOrderId) {
        // Enforce merging into the existing unpaid order for that table
        const mergedItems = [...activeOrderForTable.items];
        items.forEach((newItem) => {
          const existing = mergedItems.find(
            (it) => it.id === newItem.id && it.portion === newItem.portion
          );
          if (existing) {
            existing.quantity += newItem.quantity;
          } else {
            mergedItems.push(newItem);
          }
        });
        const updated = await updateOrderItems(activeOrderForTable.id, mergedItems, notes || activeOrderForTable.notes);
        if (updated) {
          setPlaced(updated);
        } else {
          alert("Could not append items to the active order.");
        }
      } else if (editingOrderId) {
        const updated = await updateOrderItems(editingOrderId, items, notes);
        if (updated) {
          setPlaced(updated);
        } else {
          setPlaced({
            id: editingOrderId,
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
            status: "pending",
            createdAt: Date.now(),
          });
        }
        setEditingOrderId(null);
      } else {
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
      }
      setItems([]);
      setCustomerName("");
      setNotes("");
    } catch (err) {
      console.error("Place/update order error:", err);
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
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -3 }}
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
                {m.halfPrice ? (
                  <div className="flex flex-col gap-1.5 w-full mt-3 pt-3 border-t border-border/40 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Half: <strong className="gold-text">₹{m.halfPrice}</strong></span>
                      <button
                        type="button"
                        onClick={() => add(m, "half")}
                        className="px-2.5 py-1 rounded-lg bg-secondary text-[11px] font-bold hover:bg-gradient-gold hover:text-gold-foreground transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Half
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground font-medium">Full: <strong className="gold-text">₹{m.price}</strong></span>
                      <button
                        type="button"
                        onClick={() => add(m, "full")}
                        className="px-2.5 py-1 rounded-lg bg-secondary text-[11px] font-bold hover:bg-gradient-gold hover:text-gold-foreground transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Full
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-display font-bold gold-text">₹{m.price}</span>
                    <button
                      type="button"
                      onClick={() => add(m, "full")}
                      className="w-7 h-7 rounded-full bg-gradient-gold text-gold-foreground flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
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

        {activeOrderForTable && !editingOrderId && (
          <div className="mt-3 p-3 rounded-xl bg-warning/10 border border-warning/30 flex flex-col gap-1.5 shadow-sm">
            <p className="text-xs text-foreground leading-relaxed">
              💡 Table <strong>{tableNumber}</strong> has an active unpaid order (ID: <strong>{activeOrderForTable.id}</strong>).
            </p>
            <p className="text-[10px] text-muted-foreground leading-normal">
              New items added to the cart will be automatically appended to this existing order instead of placing a new one.
            </p>
            <button
              onClick={() => {
                setItems(activeOrderForTable.items);
                setCustomerName(activeOrderForTable.customerName);
                setNotes(activeOrderForTable.notes ?? "");
                setEditingOrderId(activeOrderForTable.id);
              }}
              type="button"
              className="text-xs font-semibold px-3 py-1.5 bg-warning/20 text-warning-foreground rounded-lg hover:bg-warning/30 transition-all text-center self-start mt-1 border border-warning/30"
            >
              Modify / Edit Existing Items
            </button>
          </div>
        )}

        {editingOrderId && (
          <div className="mt-3 p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-center justify-between gap-2 shadow-sm">
            <span className="text-xs text-foreground font-medium">
              ✏️ Modifying order <strong>{editingOrderId}</strong>
            </span>
            <button
              onClick={() => {
                setItems([]);
                setCustomerName("");
                setNotes("");
                setEditingOrderId(null);
              }}
              type="button"
              className="text-xs font-bold text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition-all"
            >
              Cancel
            </button>
          </div>
        )}

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
        {/* Quick Add Items */}
        <div className="mt-4 pt-3 border-t border-border/40">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Quick Add Items</label>
          <div className="flex gap-2 mt-1.5">
            {waterBottleItem && (
              <button
                type="button"
                onClick={() => add(waterBottleItem, "full")}
                className="flex-1 glass py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between hover:gold-border transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <span>🚰</span>
                  <span>Water Bottle</span>
                </div>
                <span className="gold-text font-bold">₹{waterBottleItem.price}</span>
              </button>
            )}
            {coldDrinksItem && (
              <button
                type="button"
                onClick={() => add(coldDrinksItem, "full")}
                className="flex-1 glass py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-between hover:gold-border transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <span>🥤</span>
                  <span>Cold Drinks</span>
                </div>
                <span className="gold-text font-bold">₹{coldDrinksItem.price}</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 max-h-[40vh] overflow-y-auto pr-1 space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Cart is empty.<br />Add items from the menu.</p>
          )}
          <AnimatePresence>
            {items.map((it) => (
              <motion.div
                key={`${it.id}-${it.portion || "full"}`}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 glass rounded-xl p-2.5"
              >
                <div className="text-xl">{it.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{it.name} {it.portion === "half" ? "(Half)" : ""}</p>
                  <p className="text-xs text-muted-foreground">₹{it.price} × {it.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => dec(it.id, it.portion)} className="w-7 h-7 rounded-md bg-card flex items-center justify-center hover:bg-secondary">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{it.quantity}</span>
                  <button onClick={() => add(it, it.portion)} className="w-7 h-7 rounded-md bg-card flex items-center justify-center hover:bg-secondary">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => remove(it.id, it.portion)} className="w-7 h-7 rounded-md text-destructive hover:bg-destructive/10 flex items-center justify-center">
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
          <Send className="w-4 h-4" /> {editingOrderId ? "Update Order" : "Place Order"}
        </button>
      </div>
    </div>
  );
}
