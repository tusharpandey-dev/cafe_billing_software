"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { ReceiptCard } from "@/components/ReceiptCard";
import { Search } from "lucide-react";

export default function AdminBilling() {
  const orders = useStore((s) => s.orders);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = orders.filter((o) =>
    search
      ? `${o.id} ${o.customerName} ${o.tableNumber}`.toLowerCase().includes(search.toLowerCase())
      : true
  );
  const open = orders.find((o) => o.id === openId);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Billing History</h1>
          <p className="text-sm text-muted-foreground">All transactions · Revenue ₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bills…"
            className="bg-input/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm w-56 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-card">
        <div className="hidden md:grid grid-cols-[1fr_80px_1fr_100px_100px_120px_80px] gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/40 bg-secondary/20">
          <span>Bill ID</span><span>Table</span><span>Customer</span><span>Items</span><span>Status</span><span>Total</span><span></span>
        </div>
        {filtered.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-2 md:grid-cols-[1fr_80px_1fr_100px_100px_120px_80px] gap-3 px-5 py-4 text-sm border-b border-border/30 hover:bg-card/40 transition-colors items-center"
          >
            <span className="font-semibold">{o.id}</span>
            <span className="text-muted-foreground">T{o.tableNumber}</span>
            <span className="truncate">{o.customerName}</span>
            <span className="text-muted-foreground text-xs">{o.items.length} items</span>
            <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider w-fit ${
              o.status === "completed" ? "bg-success/20 text-success" :
              o.status === "preparing" ? "bg-accent/20 text-accent" : "bg-warning/20 text-warning"
            }`}>{o.status}</span>
            <span className="font-display font-bold gold-text">₹{o.total.toFixed(2)}</span>
            <button onClick={() => setOpenId(o.id)} className="text-xs text-primary hover:underline">View</button>
          </motion.div>
        ))}
        {!filtered.length && <p className="text-center text-muted-foreground py-12">No bills.</p>}
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
