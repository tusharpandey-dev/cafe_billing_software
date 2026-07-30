"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/data/ordersData";
import { Search, Eye, ChefHat, CheckCircle2, Clock } from "lucide-react";
import { ReceiptCard } from "@/components/ReceiptCard";

const statusMeta: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-warning/20 text-warning border-warning/40", icon: <Clock className="w-3.5 h-3.5" /> },
  preparing: { label: "Preparing", color: "bg-accent/20 text-accent border-accent/40", icon: <ChefHat className="w-3.5 h-3.5" /> },
  completed: { label: "Completed", color: "bg-success/20 text-success border-success/40", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export default function AdminOrders() {
  const { orders, updateStatus } = useStore();
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
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
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1 ${statusMeta[o.status].color}`}>
                  {statusMeta[o.status].icon}
                  {statusMeta[o.status].label}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs">
                {o.items.slice(0, 3).map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span className="truncate">{it.emoji} {it.name} ×{it.quantity}</span>
                    <span className="text-muted-foreground">₹{it.price * it.quantity}</span>
                  </div>
                ))}
                {o.items.length > 3 && <p className="text-muted-foreground">+ {o.items.length - 3} more</p>}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                <span className="font-display font-bold gold-text text-lg">₹{o.total.toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              <div className="flex gap-2 mt-3">
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
    </div>
  );
}
