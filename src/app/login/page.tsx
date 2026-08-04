"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Coffee, Lock, Mail, Shield, Utensils } from "lucide-react";
import { useStore } from "@/lib/store";
import { demoUsers, type Role } from "@/data/usersData";
import { useRouter } from "next/navigation";

export default function Login() {
  const [role, setRole] = useState<Role>("waiter");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useStore((s) => s.login);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      login({ role: data.role, name: data.name, email: data.email });
      router.push(role === "admin" ? "/admin" : "/waiter");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const fill = () => {
    const u = demoUsers[role];
    setEmail(u.email);
    setPassword(u.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-elegant"
      >
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <Coffee className="w-7 h-7 text-gold-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold text-center gold-text">Cafe Milano</h1>
        <p className="text-center text-sm text-muted-foreground mt-1">Sign in to your POS</p>

        <div className="grid grid-cols-2 gap-2 mt-6 p-1 glass rounded-xl">
          {(["waiter", "admin"] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === r
                  ? "bg-gradient-gold text-gold-foreground shadow-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === "admin" ? <Shield className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
              {r === "admin" ? "Admin" : "Waiter"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-gold text-gold-foreground rounded-xl py-3 font-semibold shadow-gold hover:scale-[1.01] transition-transform"
          >
            Sign in as {role === "admin" ? "Admin" : "Waiter"}
          </button>
        </form>

        <div className="mt-6 p-4 glass rounded-xl text-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="uppercase tracking-widest text-muted-foreground">Demo Credentials</p>
            <button onClick={fill} className="text-primary hover:underline">Auto-fill</button>
          </div>
          <p className="text-muted-foreground">
            <span className="text-foreground font-semibold capitalize">{role}:</span>{" "}
            {demoUsers[role].email} / {demoUsers[role].password}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
