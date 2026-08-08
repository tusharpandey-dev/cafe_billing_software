"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Smartphone, ShieldAlert, ArrowRight, Loader2 } from "lucide-react";

export default function WaiterDeviceSetup() {
  const router = useRouter();
  const login = useStore((s) => s.login);
  const [step, setStep] = useState(1);
  
  // Credentials & setup state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [deviceName, setDeviceName] = useState("");
  
  // Loading & error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Generate default device name from user-agent/platform if possible
    if (typeof window !== "undefined") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setDeviceName(isMobile ? "Waiter Mobile" : "Waiter POS Terminal");
    }
  }, []);

  const getOrCreateDeviceId = () => {
    let devId = localStorage.getItem("waiter_device_id");
    if (!devId) {
      devId = "DEV-" + Math.random().toString(36).substring(2, 15).toUpperCase();
      localStorage.setItem("waiter_device_id", devId);
    }
    return devId;
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier,
          password,
          role: "waiter",
          deviceId,
          deviceName: deviceName || "Unknown Device",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Display exact error message or fallback
        setError(data.error || "Failed to authenticate device.");
        setLoading(false);
        return;
      }

      // Save credentials in local client store
      login({ role: data.role, name: data.name, email: data.email });
      localStorage.setItem("waiter_device_name", deviceName || "Unknown Device");

      // Redirect based on password status
      if (data.mustChangePassword) {
        router.push("/waiter/change-password");
      } else {
        router.push("/waiter");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-elegant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-gold opacity-[0.05] rounded-bl-full pointer-events-none" />
        
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <Coffee className="w-7 h-7 text-gold-foreground" />
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold text-center gold-text">Cafe Milano</h1>
        
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="mt-6 text-center"
            >
              <p className="text-base text-foreground font-semibold">Welcome to Cafe Milano</p>
              <p className="text-sm text-muted-foreground mt-2">
                Set up your waiter account on this device.
              </p>

              <button
                onClick={() => setStep(2)}
                className="mt-8 w-full flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground rounded-xl py-3.5 font-semibold shadow-gold hover:scale-[1.01] transition-transform"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <p className="text-center text-sm text-muted-foreground mb-6">
                Enter your credentials to link this device.
              </p>

              {error && (
                <div className="mb-4 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSetup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Device Identifier / Name</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul's iPad"
                      value={deviceName}
                      onChange={(e) => setDeviceName(e.target.value)}
                      className="w-full bg-input/50 border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Waiter ID / Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WT-1025 or waiter_rahul"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground rounded-xl py-3.5 font-semibold shadow-gold hover:scale-[1.01] transition-transform disabled:opacity-50 mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying & Registering Device...
                    </>
                  ) : (
                    "Login & Setup Device"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
