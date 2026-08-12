"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/data/ordersData";
import { Search, Eye, ChefHat, CheckCircle2, Clock, Plus, Minus, X } from "lucide-react";
import { ReceiptCard } from "@/components/ReceiptCard";
import type { MenuItem } from "@/data/menuData";

const statusMeta: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-warning/20 text-warning border-warning/40", icon: <Clock className="w-3.5 h-3.5" /> },
  preparing: { label: "Preparing", color: "bg-accent/20 text-accent border-accent/40", icon: <ChefHat className="w-3.5 h-3.5" /> },
  completed: { label: "Completed", color: "bg-success/20 text-success border-success/40", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export default function AdminOrders() {
  const { orders, updateStatus, payOrder, menu, updateOrderItems } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [addingItemsOrder, setAddingItemsOrder] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, { item: MenuItem; quantity: number; portion: "half" | "full" }>>({});
  const [addSearch, setAddSearch] = useState("");

  const handleAddQty = (m: MenuItem, portion: "half" | "full" = "full") => {
    const key = `${m.id}-${portion}`;
    setSelectedItems((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          item: m,
          quantity: existing ? existing.quantity + 1 : 1,
          portion,
        },
      };
    });
  };

  const handleDecQty = (m: MenuItem, portion: "half" | "full" = "full") => {
    const key = `${m.id}-${portion}`;
    setSelectedItems((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return {
        ...prev,
        [key]: {
          ...existing,
          quantity: existing.quantity - 1,
        },
      };
    });
  };

  const handleSaveAddedItems = async () => {
    if (!addingItemsOrder) return;
    const currentItems = [...addingItemsOrder.items];
    Object.values(selectedItems).forEach(({ item, quantity, portion }) => {
      const existing = currentItems.find((it) => it.id === item.id && it.portion === portion);
      if (existing) {
        existing.quantity += quantity;
      } else {
        const itemPrice = portion === "half" && item.halfPrice ? item.halfPrice : item.price;
        currentItems.push({
          ...item,
          price: itemPrice,
          portion,
          quantity,
        });
      }
    });

    await updateOrderItems(addingItemsOrder.id, currentItems, addingItemsOrder.notes);
    setAddingItemsOrder(null);
    setSelectedItems({});
  };

  const handlePay = async (order: any) => {
    if (!(window as any).Razorpay) {
      alert("Razorpay Payment SDK is loading. Please try again in a few seconds.");
      return;
    }

    try {
      const rzpOrderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: order.total }),
      });

      if (!rzpOrderRes.ok) {
        const errorData = await rzpOrderRes.json();
        alert(errorData.error || "Failed to initialize payment order.");
        return;
      }

      const rzpOrder = await rzpOrderRes.json();

      const options = {
        key: rzpOrder.key_id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "Cafe Milano",
        description: `Checkout for ${order.id} (Table #${order.tableNumber})`,
        order_id: rzpOrder.id,
        handler: async function (response: any) {
          await payOrder(order.id, {
            paymentId: response.razorpay_payment_id,
            paymentOrderId: response.razorpay_order_id,
            paymentSignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: order.customerName || "Guest",
        },
        theme: {
          color: "#E2A857",
        },
      };

      const rzpay = new (window as any).Razorpay(options);
      rzpay.open();
    } catch (err) {
      console.error("Payment flow error:", err);
      alert("An unexpected error occurred during the payment flow.");
    }
  };
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      orders
        .filter((o) => (filter === "all" ? true : o.status === filter))
        .filter((o) =>
          search
            ? `${o.id} ${o.customerName} ${o.tableNumber}`.toLowerCase().includes(search.toLowerCase())
            : true
        ),
    [orders, filter, search]
  );

  const open = orders.find((o) => o.id === openId);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Live Orders</h1>
          <p className="text-sm text-muted-foreground">Manage incoming orders by status</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders…"
              className="bg-input/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm w-56 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {(["all", "pending", "preparing", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
              filter === f ? "bg-gradient-gold text-gold-foreground shadow-gold" : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} {f !== "all" && `(${orders.filter((o) => o.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {list.map((o, i) => (
            <motion.div
              key={o.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-5 shadow-card hover:gold-border transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display font-bold text-lg">{o.id}</p>
                  <p className="text-xs text-muted-foreground">Table {o.tableNumber} · {o.customerName}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1 ${statusMeta[o.status].color}`}>
                    {statusMeta[o.status].icon}
                    {statusMeta[o.status].label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border font-medium ${
                    o.paymentStatus === "paid"
                      ? "bg-success/20 text-success border-success/40"
                      : "bg-destructive/20 text-destructive border-destructive/40"
                  }`}>
                    {o.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-xs">
                {o.items.slice(0, 3).map((it, idx) => (
                  <div key={it.id ? `${it.id}-${it.portion || "full"}` : `${it.name}-${idx}-${it.portion || "full"}`} className="flex justify-between">
                    <span className="truncate">{it.emoji} {it.name} {it.portion === "half" ? "(Half)" : ""} ×{it.quantity}</span>
                    <span className="text-muted-foreground">₹{it.price * it.quantity}</span>
                  </div>
                ))}
                {o.items.length > 3 && <p className="text-muted-foreground">+ {o.items.length - 3} more</p>}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                <span className="font-display font-bold gold-text text-lg">₹{o.total.toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {o.status === "pending" && (
                  <button onClick={() => updateStatus(o.id, "preparing")} className="flex-1 bg-accent text-accent-foreground rounded-lg py-2 text-xs font-semibold hover:opacity-90">
                    Start
                  </button>
                )}
                {o.status === "preparing" && (
                  <button onClick={() => updateStatus(o.id, "completed")} className="flex-1 bg-success text-background rounded-lg py-2 text-xs font-semibold hover:opacity-90">
                    Complete
                  </button>
                )}
                {o.paymentStatus !== "paid" && (
                  <button onClick={() => { setAddingItemsOrder(o); setSelectedItems({}); }} className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg py-2 text-xs font-semibold hover:gold-border whitespace-nowrap">
                    Add Items
                  </button>
                )}
                {o.paymentStatus !== "paid" && (
                  <button onClick={() => handlePay(o)} className="flex-1 bg-gradient-gold text-gold-foreground rounded-lg py-2 text-xs font-semibold hover:opacity-90 whitespace-nowrap">
                    Collect Payment
                  </button>
                )}
                <button onClick={() => setOpenId(o.id)} className="px-3 py-2 glass rounded-lg text-xs flex items-center gap-1 hover:gold-border">
                  <Eye className="w-3.5 h-3.5" /> Bill
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {!list.length && <p className="col-span-full text-center text-muted-foreground py-12">No orders match.</p>}
      </div>

      {open && (
        <div onClick={() => setOpenId(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div onClick={(e) => e.stopPropagation()}>
            <ReceiptCard order={open} />
          </div>
        </div>
      )}

      {addingItemsOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-strong rounded-2xl p-6 w-full max-w-lg shadow-elegant border border-border relative flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold">Add Items to {addingItemsOrder.id}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Table {addingItemsOrder.tableNumber} · {addingItemsOrder.customerName}</p>
              </div>
              <button onClick={() => setAddingItemsOrder(null)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={addSearch}
                onChange={(e) => setAddSearch(e.target.value)}
                placeholder="Search menu items…"
                className="w-full bg-input/40 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-4 scrollbar-thin">
              {menu
                .filter((m) => m.name.toLowerCase().includes(addSearch.toLowerCase()))
                .map((m) => {
                  const keyFull = `${m.id}-full`;
                  const keyHalf = `${m.id}-half`;
                  const qtyFull = selectedItems[keyFull]?.quantity || 0;
                  const qtyHalf = selectedItems[keyHalf]?.quantity || 0;

                  return (
                    <div key={m.id} className="glass rounded-xl p-3 border border-border/40 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-base mr-1.5">{m.emoji}</span>
                          <span className="font-semibold text-sm">{m.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">{m.category}</span>
                      </div>

                      {m.halfPrice ? (
                        <div className="flex flex-col gap-2 pt-1 border-t border-border/20 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Half Price: <strong className="gold-text">₹{m.halfPrice}</strong></span>
                            <div className="flex items-center gap-2">
                              {qtyHalf > 0 && (
                                <>
                                  <button onClick={() => handleDecQty(m, "half")} className="w-6 h-6 rounded bg-card hover:bg-secondary flex items-center justify-center">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-sm font-semibold w-4 text-center">{qtyHalf}</span>
                                </>
                              )}
                              <button onClick={() => handleAddQty(m, "half")} className="w-6 h-6 rounded bg-card hover:bg-secondary flex items-center justify-center text-primary">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Full Price: <strong className="gold-text">₹{m.price}</strong></span>
                            <div className="flex items-center gap-2">
                              {qtyFull > 0 && (
                                <>
                                  <button onClick={() => handleDecQty(m, "full")} className="w-6 h-6 rounded bg-card hover:bg-secondary flex items-center justify-center">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-sm font-semibold w-4 text-center">{qtyFull}</span>
                                </>
                              )}
                              <button onClick={() => handleAddQty(m, "full")} className="w-6 h-6 rounded bg-card hover:bg-secondary flex items-center justify-center text-primary">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-1 border-t border-border/20 text-xs">
                          <span className="text-muted-foreground font-medium">Price: <strong className="gold-text">₹{m.price}</strong></span>
                          <div className="flex items-center gap-2">
                            {qtyFull > 0 && (
                                <>
                                  <button onClick={() => handleDecQty(m, "full")} className="w-6 h-6 rounded bg-card hover:bg-secondary flex items-center justify-center">
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-sm font-semibold w-4 text-center">{qtyFull}</span>
                                </>
                            )}
                            <button onClick={() => handleAddQty(m, "full")} className="w-6 h-6 rounded bg-card hover:bg-secondary flex items-center justify-center text-primary">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAddingItemsOrder(null)}
                className="flex-1 glass rounded-xl py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddedItems}
                disabled={Object.keys(selectedItems).length === 0}
                className="flex-1 bg-gradient-gold text-gold-foreground rounded-xl py-2.5 text-xs font-semibold shadow-gold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Update Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
