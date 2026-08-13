"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Drumstick, Plus, Pencil, Trash2, FolderPlus, X } from "lucide-react";
import { useStore, type MenuItem } from "@/lib/store";

type Draft = {
  name: string;
  price: string;
  halfPrice: string;
  category: string;
  emoji: string;
  description: string;
  veg: boolean;
};

const emptyDraft = (cat: string): Draft => ({
  name: "",
  price: "",
  halfPrice: "",
  category: cat,
  emoji: "🍽️",
  description: "",
  veg: true,
});

export default function AdminMenu() {
  const { menu, categories, addMenuItem, updateMenuItem, deleteMenuItem, addCategory } = useStore();
  const [activeCat, setActiveCat] = useState<string>("All");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showItem, setShowItem] = useState(false);
  const [showCat, setShowCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft(categories[0] ?? ""));

  const [quickPrices, setQuickPrices] = useState<Record<string, string>>({});

  const saveQuickPrice = async (id: string) => {
    const val = quickPrices[id];
    if (!val || isNaN(Number(val)) || Number(val) <= 0) return;
    await updateMenuItem(id, { price: Number(val) });
  };

  const list = activeCat === "All"
    ? menu.filter((m) => m.category !== "Quick Add")
    : menu.filter((m) => m.category === activeCat && m.category !== "Quick Add");

  const openAdd = () => {
    setEditing(null);
    setDraft(emptyDraft(activeCat === "All" ? categories[0] ?? "" : activeCat));
    setShowItem(true);
  };
  const openEdit = (m: MenuItem) => {
    setEditing(m);
    setDraft({
      name: m.name,
      price: String(m.price),
      halfPrice: m.halfPrice !== undefined && m.halfPrice !== null ? String(m.halfPrice) : "",
      category: m.category,
      emoji: m.emoji,
      description: m.description,
      veg: m.veg,
    });
    setShowItem(true);
  };
  const save = () => {
    const price = Number(draft.price);
    if (!draft.name.trim() || !draft.category || !price) return;
    const payload = {
      name: draft.name.trim(),
      price,
      halfPrice: draft.halfPrice ? Number(draft.halfPrice) : null,
      category: draft.category,
      emoji: draft.emoji || "🍽️",
      description: draft.description.trim(),
      veg: draft.veg,
    };
    if (editing) updateMenuItem(editing.id, payload);
    else addMenuItem(payload);
    setShowItem(false);
  };
  const saveCat = () => {
    if (!newCat.trim()) return;
    addCategory(newCat);
    setActiveCat(newCat.trim());
    setNewCat("");
    setShowCat(false);
  };

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Menu</h1>
          <p className="text-sm text-muted-foreground">
            {menu.length} items across {categories.length} categories
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCat(true)}
            className="glass px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:gold-border transition-all"
          >
            <FolderPlus className="w-4 h-4" /> Add Category
          </button>
          <button
            onClick={openAdd}
            className="bg-gradient-gold text-gold-foreground px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-gold hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-4 h-4" /> Add Menu
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
        {["All", ...categories].map((c) => (
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

      {/* Quick Add Items Pricing Panel */}
      <div className="glass rounded-2xl p-5 mb-6 hover:gold-border transition-all">
        <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Quick Add Items (Admin Pricing)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menu.filter((m) => m.category === "Quick Add").map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-4 p-3 bg-secondary/20 rounded-xl border border-border/40">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <div>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">Current Price: ₹{m.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">₹</span>
                  <input
                    type="number"
                    value={quickPrices[m.id] !== undefined ? quickPrices[m.id] : String(m.price)}
                    onChange={(e) => setQuickPrices((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    className="w-20 bg-input/50 border border-border rounded-lg pl-6 pr-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                    placeholder={String(m.price)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => saveQuickPrice(m.id)}
                  disabled={quickPrices[m.id] === undefined || quickPrices[m.id] === String(m.price) || !quickPrices[m.id]}
                  className="px-3 py-1.5 rounded-lg bg-gradient-gold text-gold-foreground text-xs font-semibold shadow-gold disabled:opacity-40 disabled:shadow-none transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {list.map((m, i) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.02 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-4 hover:gold-border transition-all group relative"
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl">{m.emoji}</div>
                <div className="flex items-center gap-2">
                  {m.veg ? (
                    <Leaf className="w-4 h-4 text-success" />
                  ) : (
                    <Drumstick className="w-4 h-4 text-destructive" />
                  )}
                  <button
                    onClick={() => openEdit(m)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMenuItem(m.id)}
                    className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="font-semibold mt-2 text-sm">{m.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{m.description}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.category}</span>
                <div className="flex flex-col items-end">
                  <span className="font-display font-bold gold-text text-sm">₹{m.price} <span className="text-[9px] text-muted-foreground font-sans uppercase">Full</span></span>
                  {m.halfPrice && (
                    <span className="font-display font-semibold text-muted-foreground text-xs">₹{m.halfPrice} <span className="text-[9px] uppercase">Half</span></span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Item Dialog */}
      <AnimatePresence>
        {showItem && (
          <Modal onClose={() => setShowItem(false)} title={editing ? "Edit Menu Item" : "Add Menu Item"}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" className="col-span-2">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="field"
                  placeholder="Margherita Pizza"
                />
              </Field>
              <Field label="Price (₹) (Full)">
                <input
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  className="field"
                  placeholder="199"
                />
              </Field>
              <Field label="Price (₹) (Half - Optional)">
                <input
                  type="number"
                  value={draft.halfPrice}
                  onChange={(e) => setDraft({ ...draft, halfPrice: e.target.value })}
                  className="field"
                  placeholder="e.g. 109"
                />
              </Field>
              <Field label="Emoji" className="col-span-2">
                <input
                  value={draft.emoji}
                  onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
                  className="field"
                  placeholder="🍕"
                />
              </Field>
              <Field label="Category" className="col-span-2">
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="field"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Description" className="col-span-2">
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={2}
                  className="field resize-none"
                  placeholder="Short description"
                />
              </Field>
              <Field label="Type" className="col-span-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, veg: true })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      draft.veg ? "bg-success/15 border-success text-success" : "glass border-border text-muted-foreground"
                    }`}
                  >
                    🥬 Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, veg: false })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      !draft.veg ? "bg-destructive/15 border-destructive text-destructive" : "glass border-border text-muted-foreground"
                    }`}
                  >
                    🍗 Non-Veg
                  </button>
                </div>
              </Field>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowItem(false)} className="flex-1 glass rounded-xl py-2.5 text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={save}
                className="flex-1 bg-gradient-gold text-gold-foreground rounded-xl py-2.5 text-sm font-semibold shadow-gold"
              >
                {editing ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </Modal>
        )}
        {showCat && (
          <Modal onClose={() => setShowCat(false)} title="Add Category">
            <Field label="Category name">
              <input
                autoFocus
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveCat()}
                className="field"
                placeholder="Desserts"
              />
            </Field>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowCat(false)} className="flex-1 glass rounded-xl py-2.5 text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={saveCat}
                className="flex-1 bg-gradient-gold text-gold-foreground rounded-xl py-2.5 text-sm font-semibold shadow-gold"
              >
                Add Category
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong rounded-2xl p-6 w-full max-w-lg shadow-elegant border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
        <style>{`.field{width:100%;background:color-mix(in srgb, var(--input) 50%, transparent);border:1px solid var(--border);border-radius:.5rem;padding:.5rem .75rem;font-size:.875rem;outline:none;color:inherit;}.field:focus{border-color:var(--primary)}`}</style>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
