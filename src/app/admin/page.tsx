"use client";

import { useStore } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { TrendingUp, ShoppingBag, CheckCircle2, Clock, Coffee, Users } from "lucide-react";
import { motion } from "framer-motion";
import { tables } from "@/data/tablesData";

export default function AdminDashboard() {
  const orders = useStore((s) => s.orders);
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const preparing = orders.filter((o) => o.status === "preparing").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const activeTables = new Set(
    orders.filter((o) => o.status !== "completed").map((o) => o.tableNumber)
  ).size;

  // Mini bar chart data — sales by category
  const salesByCat: Record<string, number> = {};
  orders.forEach((o) =>
    o.items.forEach((i) => {
      salesByCat[i.category] =
        (salesByCat[i.category] || 0) + i.price * i.quantity;
    })
  );
  const catEntries = Object.entries(salesByCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCat = Math.max(1, ...catEntries.map(([, v]) => v));

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="glass rounded-xl px-4 py-2 text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Orders"
          value={total}
          icon={<ShoppingBag className="w-5 h-5" />}
          delay={0}
        />
        <StatCard
          label="Pending"
          value={pending}
          icon={<Clock className="w-5 h-5" />}
          delay={0.05}
        />
        <StatCard
          label="Preparing"
          value={preparing}
          icon={<Coffee className="w-5 h-5" />}
          delay={0.1}
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={<CheckCircle2 className="w-5 h-5" />}
          delay={0.15}
        />
        <StatCard
          label="Active Tables"
          value={`${activeTables}/${tables.length}`}
          icon={<Users className="w-5 h-5" />}
          delay={0.2}
        />
        <StatCard
          label="Revenue"
          value={`₹${revenue.toFixed(0)}`}
          hint="Today"
          icon={<TrendingUp className="w-5 h-5" />}
          delay={0.25}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-6 shadow-card"
        >
          <h2 className="font-display text-xl font-bold mb-4">Sales by Category</h2>
          <div className="space-y-3">
            {catEntries.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{cat}</span>
                  <span className="font-semibold">₹{val.toFixed(0)}</span>
                </div>
                <div className="h-2 bg-secondary/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(val / maxCat) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-gold rounded-full"
                  />
                </div>
              </div>
            ))}
            {!catEntries.length && (
              <p className="text-sm text-muted-foreground">No sales yet.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-6 shadow-card"
        >
          <h2 className="font-display text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-gold/20 flex items-center justify-center text-primary text-xs font-bold">
                  T{o.tableNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {o.id} · {o.customerName}
                  </p>
                  <p className="text-[11px] text-muted-foreground capitalize">
                    {o.status} · ₹{o.total.toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
