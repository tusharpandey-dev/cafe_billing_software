"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { ReceiptCard } from "@/components/ReceiptCard";
import {
  Search,
  Filter,
  DollarSign,
  Receipt,
  TrendingUp,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  Download,
} from "lucide-react";
import type { Order } from "@/data/ordersData";
import * as XLSX from "xlsx";

type TimeRange = "day" | "week" | "month" | "year" | "all";

export default function AdminBilling() {
  const orders = useStore((s) => s.orders);
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRange>("day");
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const timeRangeFiltered = useMemo(() => {
    const now = Date.now();
    return orders.filter((o) => {
      if (!o.createdAt) return true;
      const diff = now - o.createdAt;
      switch (timeRange) {
        case "day":
          return diff <= 24 * 60 * 60 * 1000;
        case "week":
          return diff <= 7 * 24 * 60 * 60 * 1000;
        case "month":
          return diff <= 30 * 24 * 60 * 60 * 1000;
        case "year":
          return diff <= 365 * 24 * 60 * 60 * 1000;
        case "all":
        default:
          return true;
      }
    });
  }, [orders, timeRange]);

  // Filtered orders for flat list view (e.g. Last 24 Hours)
  const filteredIndividualOrders = useMemo(() => {
    return timeRangeFiltered.filter((o) =>
      search
        ? `${o.id} ${o.customerName || ""} T${o.tableNumber} ${o.status}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : true
    );
  }, [timeRangeFiltered, search]);

  // Group orders by day (for Last Week, Last Month, Last Year, All Time)
  const groupedDays = useMemo(() => {
    const map = new Map<
      string,
      {
        dateKey: string;
        timestamp: number;
        dateFormatted: string;
        dayOfWeek: string;
        orders: Order[];
        totalIncome: number;
      }
    >();

    timeRangeFiltered.forEach((o) => {
      const d = new Date(o.createdAt || Date.now());
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
      const dateFormatted = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "long" });

      const existing = map.get(dateKey);
      if (existing) {
        existing.orders.push(o);
        existing.totalIncome += o.total || 0;
      } else {
        map.set(dateKey, {
          dateKey,
          timestamp: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
          dateFormatted,
          dayOfWeek,
          orders: [o],
          totalIncome: o.total || 0,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
  }, [timeRangeFiltered]);

  // Filter grouped days based on search query
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedDays;
    const q = search.toLowerCase();

    return groupedDays
      .map((group) => {
        const dateMatch =
          group.dateFormatted.toLowerCase().includes(q) ||
          group.dayOfWeek.toLowerCase().includes(q);

        const matchingOrders = group.orders.filter((o) =>
          `${o.id} ${o.customerName || ""} T${o.tableNumber} ${o.status}`
            .toLowerCase()
            .includes(q)
        );

        if (dateMatch) {
          return group;
        } else if (matchingOrders.length > 0) {
          return { ...group, orders: matchingOrders };
        }
        return null;
      })
      .filter(Boolean) as typeof groupedDays;
  }, [groupedDays, search]);

  const open = orders.find((o) => o.id === openId);

  // Summary Metrics
  const totalRevenue = useMemo(() => {
    return timeRangeFiltered.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [timeRangeFiltered]);

  const completedOrders = useMemo(() => {
    return timeRangeFiltered.filter((o) => o.status === "completed");
  }, [timeRangeFiltered]);

  const avgOrderValue = timeRangeFiltered.length > 0 ? totalRevenue / timeRangeFiltered.length : 0;

  const toggleDay = (dateKey: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const toggleAllDays = () => {
    const allExpanded = filteredGroups.every((g) => expandedDays[g.dateKey]);
    const nextState: Record<string, boolean> = {};
    filteredGroups.forEach((g) => {
      nextState[g.dateKey] = !allExpanded;
    });
    setExpandedDays(nextState);
  };

  // Export proper Excel (.xlsx) for a specific day
  const exportDayCSV = (group: {
    dateFormatted: string;
    dayOfWeek: string;
    orders: Order[];
    totalIncome: number;
  }) => {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Billing Detail ──────────────────────────────────────
    const billingRows = group.orders.map((o, idx) => ({
      "#": idx + 1,
      "Bill ID": o.id,
      "Date & Time": o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
      "Table No": `T${o.tableNumber}`,
      "Customer Name": o.customerName || "Guest",
      "Items Count": o.items.length,
      "Items Ordered": o.items.map((i) => `${i.quantity}x ${i.name}${i.portion === "half" ? " (Half)" : ""}`).join(", "),
      "Status": o.status.charAt(0).toUpperCase() + o.status.slice(1),
      "Total Amount (₹)": parseFloat(o.total.toFixed(2)),
    }));

    const ws1 = XLSX.utils.json_to_sheet(billingRows);

    // Set column widths
    ws1["!cols"] = [
      { wch: 4 },  // #
      { wch: 14 }, // Bill ID
      { wch: 22 }, // Date & Time
      { wch: 10 }, // Table No
      { wch: 18 }, // Customer Name
      { wch: 12 }, // Items Count
      { wch: 45 }, // Items Ordered
      { wch: 12 }, // Status
      { wch: 18 }, // Total Amount
    ];

    XLSX.utils.book_append_sheet(wb, ws1, "Billing Detail");

    // ── Sheet 2: Daily Summary ────────────────────────────────────────
    const completedCount = group.orders.filter((o) => o.status === "completed").length;
    const avgBill = group.orders.length > 0 ? group.totalIncome / group.orders.length : 0;
    const maxBill = Math.max(...group.orders.map((o) => o.total));

    const summaryRows = [
      { "Field": "Report Date", "Value": group.dateFormatted },
      { "Field": "Day of Week", "Value": group.dayOfWeek },
      { "Field": "Total Bills", "Value": group.orders.length },
      { "Field": "Completed Bills", "Value": completedCount },
      { "Field": "Total Day Revenue (₹)", "Value": parseFloat(group.totalIncome.toFixed(2)) },
      { "Field": "Average Bill Value (₹)", "Value": parseFloat(avgBill.toFixed(2)) },
      { "Field": "Highest Bill (₹)", "Value": parseFloat(maxBill.toFixed(2)) },
      { "Field": "Generated On", "Value": new Date().toLocaleString() },
    ];

    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    ws2["!cols"] = [{ wch: 26 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Daily Summary");

    // Download
    const cleanDate = group.dateFormatted.replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(wb, `Billing_Report_${cleanDate}.xlsx`);
  };

  // Export proper Excel (.xlsx) for current filtered set (e.g. Last 24 Hours)
  const exportCurrentSetCSV = () => {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: All Transactions ─────────────────────────────────────
    const billingRows = timeRangeFiltered.map((o, idx) => ({
      "#": idx + 1,
      "Bill ID": o.id,
      "Date & Time": o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
      "Table No": `T${o.tableNumber}`,
      "Customer Name": o.customerName || "Guest",
      "Items Count": o.items.length,
      "Items Ordered": o.items.map((i) => `${i.quantity}x ${i.name}${i.portion === "half" ? " (Half)" : ""}`).join(", "),
      "Status": o.status.charAt(0).toUpperCase() + o.status.slice(1),
      "Total Amount (₹)": parseFloat(o.total.toFixed(2)),
    }));

    const ws1 = XLSX.utils.json_to_sheet(billingRows);
    ws1["!cols"] = [
      { wch: 4 },  // #
      { wch: 14 }, // Bill ID
      { wch: 22 }, // Date & Time
      { wch: 10 }, // Table No
      { wch: 18 }, // Customer Name
      { wch: 12 }, // Items Count
      { wch: 45 }, // Items Ordered
      { wch: 12 }, // Status
      { wch: 18 }, // Total Amount
    ];
    XLSX.utils.book_append_sheet(wb, ws1, "All Transactions");

    // ── Sheet 2: Summary ──────────────────────────────────────────────
    const totalRev = timeRangeFiltered.reduce((s, o) => s + o.total, 0);
    const completed = timeRangeFiltered.filter((o) => o.status === "completed").length;
    const avg = timeRangeFiltered.length > 0 ? totalRev / timeRangeFiltered.length : 0;

    const summaryRows = [
      { "Field": "Period", "Value": getPeriodLabel() },
      { "Field": "Total Bills", "Value": timeRangeFiltered.length },
      { "Field": "Completed Bills", "Value": completed },
      { "Field": "Total Revenue (₹)", "Value": parseFloat(totalRev.toFixed(2)) },
      { "Field": "Average Bill Value (₹)", "Value": parseFloat(avg.toFixed(2)) },
      { "Field": "Generated On", "Value": new Date().toLocaleString() },
    ];

    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    ws2["!cols"] = [{ wch: 26 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");

    XLSX.writeFile(wb, `Billing_History_${timeRange}_${Date.now()}.xlsx`);
  };

  const timeRangeOptions: { id: TimeRange; label: string }[] = [
    { id: "day", label: "Last 24 Hours" },
    { id: "week", label: "Last Week" },
    { id: "month", label: "Last Month" },
    { id: "year", label: "Last Year" },
    { id: "all", label: "All Time" },
  ];

  const handlePrintPDF = () => {
    window.print();
  };

  const getPeriodLabel = () => {
    switch (timeRange) {
      case "day":
        return "Last 24 Hours";
      case "week":
        return "Last Week (7 Days)";
      case "month":
        return "Last Month (30 Days)";
      case "year":
        return "Last Year (365 Days)";
      default:
        return "All Time";
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold">Billing History</h1>
            <p className="text-sm text-muted-foreground">Loading billing records…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Print-Only Header */}
      <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">CAFE MILANO - BILLING HISTORY REPORT</h1>
        <p className="text-sm text-gray-600">
          Period: {getPeriodLabel()} | Generated on: {new Date().toLocaleString()}
        </p>
        <div className="flex gap-6 mt-3 text-sm font-semibold text-gray-800">
          <span>Total Bills: {timeRangeFiltered.length}</span>
          <span>Total Revenue: ₹{totalRevenue.toFixed(2)}</span>
          <span>Average Bill: ₹{avgOrderValue.toFixed(2)}</span>
        </div>
      </div>

      {/* Screen Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-display font-bold">Billing History</h1>
          <p className="text-sm text-muted-foreground">
            {timeRange === "day"
              ? "Showing transactions from the last 24 hours"
              : "Tap any day card to view bills or export specific day data"}
          </p>
        </div>

        {/* Action Controls: Search & Exports */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bill, customer, table…"
              className="w-full bg-input/50 border border-border rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={exportCurrentSetCSV}
            className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-semibold rounded-xl text-xs flex items-center gap-2 border border-border/60 transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md hover:opacity-90 transition-all shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
        <div className="glass p-4 rounded-2xl border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-2xl font-display font-bold gold-text">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Bills
            </p>
            <p className="text-2xl font-display font-bold">
              {timeRangeFiltered.length}{" "}
              <span className="text-xs text-muted-foreground font-normal">
                ({completedOrders.length} completed)
              </span>
            </p>
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-border/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success/10 text-success">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Avg Bill Value
            </p>
            <p className="text-2xl font-display font-bold">₹{avgOrderValue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Time Period Filter Pills & Expand All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Period:</span>
          </div>
          {timeRangeOptions.map((opt) => {
            const isActive = timeRange === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeRange(opt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {timeRange !== "day" && filteredGroups.length > 0 && (
          <button
            type="button"
            onClick={toggleAllDays}
            className="text-xs text-primary hover:underline font-semibold self-end sm:self-auto shrink-0"
          >
            {filteredGroups.every((g) => expandedDays[g.dateKey])
              ? "Collapse All Days"
              : "Expand All Days"}
          </button>
        )}
      </div>

      {/* Main Billing Content: Direct Bills List for Last 24 Hours vs Expandable Day Grouping for Week/Month/Year */}
      {timeRange === "day" ? (
        /* Normal individual bills table for Last 24 Hours */
        <div className="glass rounded-2xl overflow-hidden shadow-card border border-border/50 print:border-none print:shadow-none">
          <div className="hidden md:grid grid-cols-[130px_70px_1fr_160px_90px_100px_110px_70px] gap-3 px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/40 bg-secondary/20 print:grid-cols-[130px_70px_1fr_160px_90px_100px_110px]">
            <span>Bill ID</span>
            <span>Table</span>
            <span>Customer</span>
            <span>Date & Time</span>
            <span>Items</span>
            <span>Status</span>
            <span>Total</span>
            <span className="text-right print:hidden">Action</span>
          </div>

          <AnimatePresence mode="wait">
            {filteredIndividualOrders.length > 0 ? (
              filteredIndividualOrders.map((o, i) => {
                const formattedDate = o.createdAt
                  ? new Date(o.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A";

                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="grid grid-cols-2 md:grid-cols-[130px_70px_1fr_160px_90px_100px_110px_70px] gap-3 px-5 py-3.5 text-sm border-b border-border/30 hover:bg-card/40 transition-colors items-center print:grid-cols-[130px_70px_1fr_160px_90px_100px_110px]"
                  >
                    <span className="font-semibold">{o.id}</span>
                    <span className="text-muted-foreground">T{o.tableNumber}</span>
                    <span className="truncate">{o.customerName || "Guest"}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground/60 shrink-0 print:hidden" />
                      {formattedDate}
                    </span>
                    <span className="text-muted-foreground text-xs">{o.items.length} items</span>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold w-fit ${
                        o.status === "completed"
                          ? "bg-success/20 text-success"
                          : o.status === "preparing"
                          ? "bg-accent/20 text-accent"
                          : "bg-warning/20 text-warning"
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className="font-display font-bold gold-text">₹{o.total.toFixed(2)}</span>
                    <div className="text-right print:hidden">
                      <button
                        type="button"
                        onClick={() => setOpenId(o.id)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        View
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-16 px-4">
                <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  No bills found in the last 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTimeRange("all");
                    setSearch("");
                  }}
                  className="mt-3 text-xs text-primary hover:underline font-medium print:hidden"
                >
                  Clear filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Expandable Grouped Days List for Week, Month, Year, All */
        <div className="space-y-4">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => {
              const isExpanded = search.trim() ? true : !!expandedDays[group.dateKey];

              return (
                <div
                  key={group.dateKey}
                  className="glass rounded-2xl overflow-hidden border border-border/50 shadow-card transition-all"
                >
                  {/* Day Header Bar (Tappable Div instead of nested button) */}
                  <div
                    onClick={() => toggleDay(group.dateKey)}
                    className="w-full px-5 py-4 flex items-center justify-between bg-secondary/20 hover:bg-secondary/40 transition-colors text-left border-b border-border/30 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base flex items-center gap-2">
                          <span>{group.dateFormatted}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            ({group.dayOfWeek})
                          </span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {group.orders.length} bill{group.orders.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Day Income */}
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                          Day Income
                        </p>
                        <p className="font-display font-bold text-lg gold-text">
                          ₹{group.totalIncome.toFixed(2)}
                        </p>
                      </div>

                      {/* Export specific day data button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportDayCSV(group);
                        }}
                        title={`Export CSV data for ${group.dateFormatted}`}
                        className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-primary/20 transition-all print:hidden"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Export</span>
                      </button>

                      {/* Expand/Collapse chevron */}
                      <div className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground print:hidden">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sub-table: Bills for this day */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-card/20"
                      >
                        <div className="hidden md:grid grid-cols-[120px_70px_1fr_120px_80px_100px_100px_70px] gap-3 px-5 py-2.5 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/30 bg-secondary/10 print:grid-cols-[120px_70px_1fr_120px_80px_100px_100px]">
                          <span>Bill ID</span>
                          <span>Table</span>
                          <span>Customer</span>
                          <span>Time</span>
                          <span>Items</span>
                          <span>Status</span>
                          <span>Total</span>
                          <span className="text-right print:hidden">Action</span>
                        </div>

                        {group.orders.map((o) => {
                          const timeStr = o.createdAt
                            ? new Date(o.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A";

                          return (
                            <div
                              key={o.id}
                              className="grid grid-cols-2 md:grid-cols-[120px_70px_1fr_120px_80px_100px_100px_70px] gap-3 px-5 py-3 text-sm border-b border-border/20 last:border-b-0 hover:bg-card/50 transition-colors items-center print:grid-cols-[120px_70px_1fr_120px_80px_100px_100px]"
                            >
                              <span className="font-semibold text-xs">{o.id}</span>
                              <span className="text-muted-foreground text-xs">T{o.tableNumber}</span>
                              <span className="truncate text-xs">{o.customerName || "Guest"}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground/60 shrink-0 print:hidden" />
                                {timeStr}
                              </span>
                              <span className="text-muted-foreground text-xs">{o.items.length} items</span>
                              <span
                                className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold w-fit ${
                                  o.status === "completed"
                                    ? "bg-success/20 text-success"
                                    : o.status === "preparing"
                                    ? "bg-accent/20 text-accent"
                                    : "bg-warning/20 text-warning"
                                }`}
                              >
                                {o.status}
                              </span>
                              <span className="font-display font-bold text-xs gold-text">
                                ₹{o.total.toFixed(2)}
                              </span>
                              <div className="text-right print:hidden">
                                <button
                                  type="button"
                                  onClick={() => setOpenId(o.id)}
                                  className="text-xs text-primary hover:underline font-medium"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="glass rounded-2xl text-center py-16 px-4 border border-border/50">
              <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">
                No bills found for the selected time filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTimeRange("all");
                  setSearch("");
                }}
                className="mt-3 text-xs text-primary hover:underline font-medium print:hidden"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bill Details Modal */}
      {open && (
        <div
          onClick={() => setOpenId(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:hidden"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ReceiptCard order={open} />
          </div>
        </div>
      )}
    </div>
  );
}
