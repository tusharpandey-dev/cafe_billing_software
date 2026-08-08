"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Key, ShieldAlert, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WaiterChangePassword() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Confirm password does not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/waiter");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-elegant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-gold opacity-[0.05] rounded-bl-full pointer-events-none" />
        
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <Key className="w-7 h-7 text-gold-foreground" />
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold text-center gold-text">Change Password</h1>
        <p className="text-center text-sm text-muted-foreground mt-2">
          You are using a temporary password. Please update your password to continue.
        </p>

        {error && (
          <div className="mt-6 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-6 p-3 bg-success/10 border border-success/20 rounded-xl text-xs text-success flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Password updated successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Current Temporary Password</label>
            <input
              type="password"
              required
              placeholder="Temporary Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">New Password</label>
            <input
              type="password"
              required
              placeholder="New Password (Min 4 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-input/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex items-center justify-center gap-2 bg-gradient-gold text-gold-foreground rounded-xl py-3.5 font-semibold shadow-gold hover:scale-[1.01] transition-transform disabled:opacity-50 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
