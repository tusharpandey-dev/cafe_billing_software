import { motion } from "framer-motion";
import type { Order, OrderItem } from "@/data/ordersData";
import { Printer, Download } from "lucide-react";
import { useStore } from "@/lib/store";

export function ReceiptCard({ order }: { order: Order }) {
  const orders = useStore((s) => s.orders);
  
  // Find all unpaid orders for the same table to show consolidated bill
  const tableOrders = order.paymentStatus === "pending"
    ? orders.filter((o) => o.tableNumber === order.tableNumber && o.paymentStatus === "pending")
    : [order];

  const isConsolidated = tableOrders.length > 1;

  const consolidatedItems: OrderItem[] = [];
  const itemsToConsolidate = isConsolidated
    ? tableOrders.flatMap((o) => o.items)
    : order.items;

  itemsToConsolidate.forEach((item) => {
    const existing = consolidatedItems.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      consolidatedItems.push({ ...item });
    }
  });

  const subtotal = isConsolidated
    ? tableOrders.reduce((sum, o) => sum + o.subtotal, 0)
    : order.subtotal;
  const gst = isConsolidated
    ? tableOrders.reduce((sum, o) => sum + o.gst, 0)
    : order.gst;
  const total = isConsolidated
    ? tableOrders.reduce((sum, o) => sum + o.total, 0)
    : order.total;
  const id = isConsolidated
    ? tableOrders.map((o) => o.id).join(" + ")
    : order.id;
  const notes = isConsolidated
    ? tableOrders.map((o) => o.notes).filter(Boolean).join(" | ")
    : order.notes;

  const date = new Date(order.createdAt);
  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[oklch(0.98_0.01_80)] text-[oklch(0.18_0.02_60)] rounded-2xl p-6 shadow-elegant max-w-sm mx-auto font-mono text-sm"
    >
      <div className="text-center border-b border-dashed border-[oklch(0.18_0.02_60_/_30%)] pb-4">
        <p className="font-display text-2xl font-bold tracking-tight">CAFE MILANO</p>
        <p className="text-[10px] uppercase tracking-widest opacity-70">Premium Coffee & Bites</p>
        <p className="text-[10px] mt-1 opacity-60">123 Brew Street · +91 98765 43210</p>
      </div>

      <div className="flex justify-between text-xs mt-3 mb-3">
        <div>
          <p>Bill: <span className="font-semibold">{id}</span></p>
          <p>Table: <span className="font-semibold">#{order.tableNumber}</span></p>
        </div>
        <div className="text-right">
          <p>{date.toLocaleDateString()}</p>
          <p>{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>
      {order.customerName && <p className="text-xs mb-2">Customer: {order.customerName}</p>}

      <div className="border-t border-dashed border-[oklch(0.18_0.02_60_/_30%)] pt-2">
        <div className="flex text-[10px] uppercase tracking-wider opacity-60 pb-1">
          <span className="flex-1">Item</span>
          <span className="w-8 text-center">Qty</span>
          <span className="w-16 text-right">Total</span>
        </div>
        {consolidatedItems.map((it, idx) => (
          <div key={it.id || `${it.name}-${idx}`} className="flex text-xs py-1">
            <span className="flex-1 truncate pr-2">{it.name}</span>
            <span className="w-8 text-center">{it.quantity}</span>
            <span className="w-16 text-right">₹{(it.price * it.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-[oklch(0.18_0.02_60_/_30%)] mt-2 pt-2 text-xs space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-base mt-1 pt-1 border-t border-dashed border-[oklch(0.18_0.02_60_/_30%)]">
          <span>TOTAL</span><span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {notes && <p className="text-[10px] italic mt-3 opacity-70">Note: {notes}</p>}

      <div className="text-center mt-4 border-t border-dashed border-[oklch(0.18_0.02_60_/_30%)] pt-3">
        <p className="text-xs font-semibold">Thank you · Visit Again</p>
        <p className="text-[10px] opacity-60 mt-1">Powered by Cafe Milano POS</p>
      </div>

      <div className="flex gap-2 mt-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-[oklch(0.18_0.02_60)] text-[oklch(0.96_0.01_80)] rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
        <button
          className="flex-1 border border-[oklch(0.18_0.02_60)] rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[oklch(0.18_0.02_60)] hover:text-[oklch(0.96_0.01_80)]"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </button>
      </div>
    </motion.div>
  );
}
