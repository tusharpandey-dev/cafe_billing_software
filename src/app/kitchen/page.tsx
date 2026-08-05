"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/data/ordersData";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Printer,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  CheckSquare,
  Square,
  Leaf,
  Drumstick,
  Flame,
  LayoutGrid,
  Kanban,
  Bell
} from "lucide-react";

// Web Audio API Synthesizer for Kitchen Bell Chime
function playKitchenChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playNote(659.25, now, 0.25); // E5
    playNote(880.0, now + 0.15, 0.4); // A5
  } catch (e) {
    console.error("Audio chime error:", e);
  }
}

// Live Elapsed Order Timer Component
function OrderTimer({ createdAt }: { createdAt: number }) {
  const [elapsedSec, setElapsedSec] = useState(() => Math.floor((Date.now() - createdAt) / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - createdAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const formatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  let colorClass = "bg-success/15 text-success border-success/30";
  let isRush = false;

  if (mins >= 12) {
    colorClass = "bg-destructive/20 text-destructive border-destructive/50 animate-pulse font-bold";
    isRush = true;
  } else if (mins >= 5) {
    colorClass = "bg-warning/15 text-warning border-warning/30 font-semibold";
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${colorClass}`}>
      <Clock className="w-3.5 h-3.5" />
      <span>{formatted}</span>
      {isRush && (
        <span className="ml-1 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
          RUSH
        </span>
      )}
    </div>
  );
}

export default function KitchenScreen() {
  const { orders, updateStatus } = useStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");
  const [filterStation, setFilterStation] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [kotOrder, setKotOrder] = useState<Order | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const prevPendingCountRef = useRef<number>(-1);

  // Monitor real incoming orders from DB for chime & alert
  useEffect(() => {
    const currentPending = orders.filter((o) => o.status === "pending");
    const currentCount = currentPending.length;

    if (prevPendingCountRef.current !== -1 && currentCount > prevPendingCountRef.current) {
      if (soundEnabled) {
        playKitchenChime();
      }
      const newest = currentPending[0];
      if (newest) {
        setNewOrderAlert(`🔔 NEW ORDER #${newest.id} for Table ${newest.tableNumber}!`);
        setTimeout(() => setNewOrderAlert(null), 6000);
      }
    }
    prevPendingCountRef.current = currentCount;
    setLastRefreshed(new Date());
  }, [orders, soundEnabled]);

  // Extract all categories/stations from active orders
  const stations = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      o.items.forEach((it) => {
        if (it.category) set.add(it.category);
      });
    });
    return Array.from(set);
  }, [orders]);

  // Filter orders by search & station
  const filterOrder = (o: Order) => {
    const matchesSearch = search
      ? `${o.id} ${o.customerName} ${o.tableNumber} ${o.notes}`
          .toLowerCase()
          .includes(search.toLowerCase())
      : true;

    const matchesStation =
      filterStation === "all"
        ? true
        : o.items.some((it) => it.category.toLowerCase() === filterStation.toLowerCase());

    return matchesSearch && matchesStation;
  };

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "pending" && filterOrder(o)),
    [orders, filterStation, search]
  );
  const preparingOrders = useMemo(
    () => orders.filter((o) => o.status === "preparing" && filterOrder(o)),
    [orders, filterStation, search]
  );
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === "completed" && filterOrder(o)),
    [orders, filterStation, search]
  );

  const activeOrdersCount = pendingOrders.length + preparingOrders.length;
  const completedTodayCount = orders.filter((o) => o.status === "completed").length;

  const toggleCheckItem = (orderId: string, itemId: string) => {
    const key = `${orderId}_${itemId}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Flash Alert */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-gold text-gold-foreground p-4 rounded-2xl shadow-gold flex items-center justify-between font-bold"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 animate-bounce text-gold-foreground" />
              <span className="text-lg">{newOrderAlert}</span>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="px-3 py-1 bg-black/20 hover:bg-black/30 text-xs rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Stats Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <ChefHat className="w-6 h-6 text-gold-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Kitchen Display System (KDS)</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-success animate-ping" />
                Live Database Sync Active · Updated {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              soundEnabled
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? "Audio On" : "Muted"}
          </button>

          {/* Test Sound */}
          <button
            onClick={() => playKitchenChime()}
            className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-xs font-medium hover:gold-border transition-all"
          >
            <Bell className="w-3.5 h-3.5 text-primary" /> Test Bell
          </button>

          {/* View Mode Toggle */}
          <div className="flex p-1 glass rounded-xl">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "kanban"
                  ? "bg-gradient-gold text-gold-foreground shadow-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-gradient-gold text-gold-foreground shadow-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-2xl p-4 border border-warning/30 bg-warning/5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Pending Orders</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-display font-bold text-warning">{pendingOrders.length}</span>
            <Clock className="w-5 h-5 text-warning/70" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Waiting for chef</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-accent/30 bg-accent/5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">In Preparation</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-display font-bold text-accent">{preparingOrders.length}</span>
            <Flame className="w-5 h-5 text-accent/70" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Currently cooking</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-success/30 bg-success/5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Ready Today</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-display font-bold text-success">{completedTodayCount}</span>
            <CheckCircle2 className="w-5 h-5 text-success/70" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Served & complete</p>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Avg Prep Speed</p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-display font-bold gold-text">7.5m</span>
            <Sparkles className="w-5 h-5 text-primary/70" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Target &lt; 10 mins</p>
        </div>
      </div>

      {/* Station Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 glass rounded-2xl p-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 shrink-0 pl-1">
            <Filter className="w-3.5 h-3.5" /> Station:
          </span>
          <button
            onClick={() => setFilterStation("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              filterStation === "all"
                ? "bg-gradient-gold text-gold-foreground shadow-gold"
                : "hover:bg-card text-muted-foreground"
            }`}
          >
            All Stations ({orders.filter((o) => o.status !== "completed").length})
          </button>
          {stations.map((st) => (
            <button
              key={st}
              onClick={() => setFilterStation(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterStation === st
                  ? "bg-gradient-gold text-gold-foreground shadow-gold"
                  : "hover:bg-card text-muted-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search table, order #, item…"
            className="bg-input/50 border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs w-full sm:w-56 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column 1: Pending */}
          <div className="glass rounded-2xl p-4 border-t-4 border-t-warning shadow-card min-h-[600px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning animate-ping" />
                <h2 className="font-display font-bold text-lg text-warning">New Pending</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-bold">
                {pendingOrders.length}
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {pendingOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    filterStation={filterStation}
                    checkedItems={checkedItems}
                    onToggleCheck={toggleCheckItem}
                    onUpdateStatus={updateStatus}
                    onOpenKot={() => setKotOrder(order)}
                  />
                ))}
              </AnimatePresence>
              {!pendingOrders.length && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                  No pending orders.
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Preparing */}
          <div className="glass rounded-2xl p-4 border-t-4 border-t-accent shadow-card min-h-[600px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-accent animate-pulse" />
                <h2 className="font-display font-bold text-lg text-accent">Cooking / Preparing</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {preparingOrders.length}
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {preparingOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    filterStation={filterStation}
                    checkedItems={checkedItems}
                    onToggleCheck={toggleCheckItem}
                    onUpdateStatus={updateStatus}
                    onOpenKot={() => setKotOrder(order)}
                  />
                ))}
              </AnimatePresence>
              {!preparingOrders.length && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  <Flame className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                  No orders cooking.
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="glass rounded-2xl p-4 border-t-4 border-t-success shadow-card min-h-[600px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <h2 className="font-display font-bold text-lg text-success">Ready to Serve</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-success/20 text-success text-xs font-bold">
                {completedOrders.length}
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {completedOrders.map((order) => (
                  <KitchenOrderCard
                    key={order.id}
                    order={order}
                    filterStation={filterStation}
                    checkedItems={checkedItems}
                    onToggleCheck={toggleCheckItem}
                    onUpdateStatus={updateStatus}
                    onOpenKot={() => setKotOrder(order)}
                  />
                ))}
              </AnimatePresence>
              {!completedOrders.length && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                  No completed tickets.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {[...pendingOrders, ...preparingOrders, ...completedOrders].map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                filterStation={filterStation}
                checkedItems={checkedItems}
                onToggleCheck={toggleCheckItem}
                onUpdateStatus={updateStatus}
                onOpenKot={() => setKotOrder(order)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* KOT Thermal Slip Modal */}
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
              <p className="text-xs font-bold uppercase tracking-widest mt-0.5 text-gray-700">*** KITCHEN TICKET (KOT) ***</p>
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

// Subcomponent for Kitchen Card Ticket
function KitchenOrderCard({
  order,
  filterStation,
  checkedItems,
  onToggleCheck,
  onUpdateStatus,
  onOpenKot,
}: {
  order: Order;
  filterStation: string;
  checkedItems: Record<string, boolean>;
  onToggleCheck: (orderId: string, itemId: string) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
  onOpenKot: () => void;
}) {
  const visibleItems =
    filterStation === "all"
      ? order.items
      : order.items.filter((it) => it.category.toLowerCase() === filterStation.toLowerCase());

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass rounded-2xl p-4 border shadow-card transition-all hover:gold-border ${
        order.status === "pending"
          ? "border-warning/40 bg-warning/5"
          : order.status === "preparing"
          ? "border-accent/40 bg-accent/5"
          : "border-success/30 opacity-80"
      }`}
    >
      {/* Ticket Header */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl gold-text">Table {order.tableNumber}</span>
            <span className="text-xs font-mono text-muted-foreground">({order.id})</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Customer: <span className="text-foreground font-medium">{order.customerName}</span> · Waiter: {order.waiter}
          </p>
        </div>
        <OrderTimer createdAt={order.createdAt} />
      </div>

      {/* Special Kitchen Notes */}
      {order.notes && (
        <div className="mt-3 p-2.5 rounded-xl bg-warning/15 border border-warning/40 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-warning uppercase tracking-wider block text-[10px]">Special Note:</span>
            <span className="text-foreground font-semibold">{order.notes}</span>
          </div>
        </div>
      )}

      {/* Items Checklist */}
      <div className="mt-3 space-y-2">
        {visibleItems.map((it, idx) => {
          const isChecked = !!checkedItems[`${order.id}_${it.id}`];
          return (
            <div
              key={it.id || `${it.name}-${idx}`}
              onClick={() => onToggleCheck(order.id, it.id)}
              className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                isChecked
                  ? "bg-muted/40 border-border/30 line-through text-muted-foreground"
                  : "glass hover:border-primary/40 text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button type="button" className="text-primary shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-success" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <span className="text-xl">{it.emoji}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-bold truncate ${isChecked ? "text-muted-foreground" : ""}`}>
                    {it.name}
                  </p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {it.veg ? <Leaf className="w-3 h-3 text-success" /> : <Drumstick className="w-3 h-3 text-destructive" />}
                    {it.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-base font-black px-2.5 py-1 rounded-lg bg-gradient-gold text-gold-foreground shadow-gold">
                  ×{it.quantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border/40">
        <button
          onClick={onOpenKot}
          className="px-3 py-2 glass rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:gold-border transition-all text-muted-foreground hover:text-foreground"
        >
          <Printer className="w-3.5 h-3.5 text-primary" /> KOT
        </button>

        <div className="flex items-center gap-2">
          {order.status === "pending" && (
            <button
              onClick={() => onUpdateStatus(order.id, "preparing")}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-xl text-xs font-bold hover:scale-[1.02] shadow-md transition-all flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4" /> Start Cooking
            </button>
          )}

          {order.status === "preparing" && (
            <button
              onClick={() => onUpdateStatus(order.id, "completed")}
              className="px-4 py-2 bg-success text-background rounded-xl text-xs font-bold hover:scale-[1.02] shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Ready
            </button>
          )}

          {order.status === "completed" && (
            <button
              onClick={() => onUpdateStatus(order.id, "preparing")}
              className="px-3 py-2 glass rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Recall
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
