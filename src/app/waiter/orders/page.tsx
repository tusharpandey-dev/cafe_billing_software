"use client";

import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { ReceiptCard } from "@/components/ReceiptCard";
import { useState } from "react";

const statusColor: Record<string, string> = {
  pending: "bg-warning/20 text-warning",
  preparing: "bg-accent/20 text-accent",
  completed: "bg-success/20 text-success",
};

export default function WaiterOrders() {
  const { orders, auth } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const mine = orders.filter((o) => o.waiter === auth?.name);
  const open = mine.find((o) => o.id === openId);

  return (
    <div>
      <h1 className="text-3xl font-display font-bold">My Orders</h1>
      <p className="text-sm text-muted-foreground">{mine.length} orders today</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {mine.map((o, i) => (
          <motion.button
            key={o.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            onClick={() => setOpenId(o.id)}
            className="glass rounded-2xl p-4 text-left hover:gold-border transition-all w-full"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display font-bold">{o.id}</p>
                <p className="text-xs text-muted-foreground">Table {o.tableNumber} · {o.customerName}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider ${statusColor[o.status]}`}>
                {o.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-3">
              {o.items.length} items · {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <p className="font-display font-bold gold-text text-xl mt-2">₹{o.total.toFixed(2)}</p>
          </motion.button>
        ))}
        {!mine.length && <p className="text-muted-foreground col-span-full text-center py-12">No orders yet.</p>}
      </div>

      {open && (
        <div onClick={() => setOpenId(null)} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()}>
            <ReceiptCard order={open} />
          </div>
        </div>
      )}
    </div>
  );
}
