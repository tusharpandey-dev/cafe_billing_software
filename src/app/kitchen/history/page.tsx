"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import type { Order } from "@/data/ordersData";
import {
  History,
  Search,
  Printer,
  CheckCircle2,
  Utensils,
  Clock
} from "lucide-react";

export default function KitchenHistory() {
  const { orders } = useStore();
  const [search, setSearch] = useState("");
  const [kotOrder, setKotOrder] = useState<Order | null>(null);

  const list = useMemo(() => {
    return orders
      .filter((o) =>
        search
          ? `${o.id} ${o.customerName} ${o.tableNumber} ${o.waiter}`
              .toLowerCase()
              .includes(search.toLowerCase())
          : true
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [orders, search]);

  const totalPreparedCount = orders.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <History className="w-6 h-6 text-gold-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Kitchen History</h1>
              <p className="text-xs text-muted-foreground">
                Log of all past orders prepared by the kitchen
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, table, waiter…"
            className="bg-input/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 text-success flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Prepared</p>
            <p className="text-2xl font-display font-bold">{totalPreparedCount} Orders</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Disposed Items</p>
            <p className="text-2xl font-display font-bold">
              {orders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0), 0)} Items
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg Kitchen Speed</p>
            <p className="text-2xl font-display font-bold gold-text">~7.5 Mins</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-2xl p-5 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Table #</th>
                <th className="py-3 px-3">Customer & Waiter</th>
                <th className="py-3 px-3">Items Prepared</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {list.map((o) => (
                <tr key={o.id} className="hover:bg-card/50 transition-colors">
                  <td className="py-3.5 px-3 font-display font-bold text-foreground">{o.id}</td>
                  <td className="py-3.5 px-3 font-bold text-primary">Table {o.tableNumber}</td>
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-foreground">{o.customerName}</p>
                    <p className="text-xs text-muted-foreground">Waiter: {o.waiter}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1">
                      {o.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 glass rounded-lg"
                        >
                          <span>{it.emoji}</span>
                          <span>{it.name}</span>
                          <span className="font-bold text-primary">×{it.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider border font-semibold ${
                        o.status === "completed"
                          ? "bg-success/20 text-success border-success/40"
                          : o.status === "preparing"
                          ? "bg-accent/20 text-accent border-accent/40"
                          : "bg-warning/20 text-warning border-warning/40"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                    <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                    <div className="text-[10px]">{new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => setKotOrder(o)}
                      className="px-3 py-1.5 glass rounded-xl text-xs font-semibold hover:gold-border transition-all flex items-center gap-1.5 ml-auto"
                    >
                      <Printer className="w-3.5 h-3.5 text-primary" /> Print KOT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!list.length && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No kitchen orders found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* KOT Reprint Modal */}
      {kotOrder && (
        <div
          onClick={() => setKotOrder(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white text-black p-6 rounded-2xl shadow-2xl font-mono text-sm border-2 border-dashed border-gray-400"
          >
            <div className="text-center border-b-2 border-black pb-3 mb-3">
              <h2 className="text-xl font-bold uppercase tracking-wider">Cafe Milano</h2>
              <p className="text-xs font-bold uppercase tracking-widest mt-0.5 text-gray-700">*** REPRINT KOT ***</p>
            </div>

            <div className="space-y-1 text-xs mb-3 border-b border-gray-300 pb-3">
              <div className="flex justify-between font-bold text-sm">
                <span>TABLE #{kotOrder.tableNumber}</span>
                <span>{kotOrder.id}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Customer: {kotOrder.customerName}</span>
                <span>Waiter: {kotOrder.waiter}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-[10px]">
                <span>Date: {new Date(kotOrder.createdAt).toLocaleDateString()}</span>
                <span>Time: {new Date(kotOrder.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            {kotOrder.notes && (
              <div className="bg-yellow-100 border-2 border-yellow-400 p-2.5 rounded-lg mb-3">
                <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-wider">⚠️ KITCHEN INSTRUCTIONS:</p>
                <p className="text-xs font-bold text-black mt-0.5">{kotOrder.notes}</p>
              </div>
            )}

            <div className="border-b-2 border-black pb-3 mb-3 space-y-2">
              <p className="font-bold text-xs uppercase tracking-wider border-b border-gray-200 pb-1">ITEM DETAILS:</p>
              {kotOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-base">{it.quantity} × {it.name}</span>
                    <span className="text-[10px] block text-gray-500">{it.category} {it.veg ? "(Veg)" : "(Non-Veg)"}</span>
                  </div>
                  <span className="text-lg font-black">{it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs font-bold pt-1 mb-4">
              <span>TOTAL ITEMS: {kotOrder.items.reduce((s, i) => s + i.quantity, 0)}</span>
              <span className="uppercase px-2 py-0.5 bg-black text-white rounded text-[10px]">{kotOrder.status}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-black text-white rounded-xl py-2.5 font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print KOT
              </button>
              <button
                onClick={() => setKotOrder(null)}
                className="px-4 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
