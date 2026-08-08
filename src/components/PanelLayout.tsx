"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Coffee, LogOut } from "lucide-react";

type NavItem = { to: string; label: string; icon: ReactNode };

export function PanelLayout({ items, title, children }: { items: NavItem[]; title: string; children?: ReactNode }) {
  const { auth, logout } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("API logout failed:", e);
    }
    logout();
    router.push("/login");
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background">
      {/* Sidebar - Fixed & Non-Scrollable */}
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden md:flex w-64 h-screen shrink-0 flex-col glass-strong border-r border-border/50 p-5 select-none"
      >
        <Link href="/" className="flex items-center gap-3 mb-10 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <Coffee className="w-5 h-5 text-gold-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-tight gold-text">Cafe Milano</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{title}</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-none">
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all shrink-0 ${
                  active
                    ? "bg-gradient-gold text-gold-foreground shadow-gold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                }`}
              >
                <span className={active ? "" : "group-hover:text-primary transition-colors"}>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 pt-4 mt-auto shrink-0">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-semibold text-foreground">{auth?.name}</p>
            {auth?.employeeId && (
              <p className="text-xs text-gold font-mono font-semibold">ID: {auth.employeeId}</p>
            )}
            <p className="text-[10px] text-muted-foreground capitalize">{auth?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 glass-strong border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
            <Coffee className="w-4 h-4 text-gold-foreground" />
          </div>
          <span className="font-display font-bold gold-text">Cafe Milano</span>
        </Link>
        <button onClick={handleLogout} className="text-xs text-muted-foreground">Logout</button>
      </div>

      {/* Main Content Area - Independently Scrollable */}
      <div className="flex-1 h-screen overflow-y-auto min-w-0 flex flex-col">
        <main className="flex-1 min-w-0 p-4 md:p-8 pt-20 md:pt-8">
          {/* Mobile nav pills */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 -mx-4 px-4">
            {items.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    active ? "bg-gradient-gold text-gold-foreground" : "glass text-muted-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
