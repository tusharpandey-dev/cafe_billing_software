"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coffee, Utensils, Shield, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <Coffee className="w-5 h-5 text-gold-foreground" />
          </div>
          <span className="font-display text-xl font-bold gold-text">Cafe Milano</span>
        </div>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Sign in →
        </Link>
      </header>

      <main className="flex-1 px-6 md:px-12 flex items-center">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Premium POS Suite</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold leading-[1.05]">
              Brew, bill &<br />
              <span className="gold-text">serve</span> with elegance.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              The complete cafe billing experience — waiter ordering, live kitchen flow, and printable receipts in one beautiful workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 bg-gradient-gold text-gold-foreground rounded-xl px-6 py-3.5 font-semibold shadow-gold hover:scale-[1.02] transition-transform"
              >
                Launch POS
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="glass rounded-xl px-6 py-3.5 font-semibold hover:gold-border transition-all"
              >
                View Demo
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: <Utensils className="w-6 h-6" />, title: "Waiter Panel", desc: "Touch-friendly POS for fast order entry", to: "/login" },
              { icon: <Shield className="w-6 h-6" />, title: "Admin Panel", desc: "Live orders, sales & menu management", to: "/login" },
              { icon: <Coffee className="w-6 h-6" />, title: "13 Categories", desc: "Pizzas, coffee, shakes & more", to: "/login" },
              { icon: <Sparkles className="w-6 h-6" />, title: "Smart Billing", desc: "GST, receipt cards, instant print", to: "/login" },
            ].map((c, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="glass rounded-2xl p-5 shadow-card hover-lift"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-gold/20 flex items-center justify-center text-primary mb-3">
                  {c.icon}
                </div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <footer className="px-6 md:px-12 py-6 text-xs text-muted-foreground text-center border-t border-border/40">
        © {new Date().getFullYear()} Cafe Milano · Premium POS Edition
      </footer>
    </div>
  );
}
