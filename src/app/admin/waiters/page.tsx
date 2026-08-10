"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Plus, Edit2, Key, ToggleLeft, ToggleRight, Trash2, Link2Off, 
  Copy, Share2, Check, X, ShieldAlert, Smartphone, RefreshCw, Eye, EyeOff
} from "lucide-react";

interface Waiter {
  _id: string;
  name: string;
  username: string;
  mobile: string;
  employeeId: string;
  branchId: string;
  restaurantId: string;
  status: "active" | "inactive";
  deviceId?: string;
  deviceName?: string;
  lastLogin?: string;
  plainPassword?: string;
}

export default function WaitersAdmin() {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Modals / Dialogs states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);

  // Form States
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [branchId, setBranchId] = useState("default-branch");
  const [restaurantId, setRestaurantId] = useState("default-restaurant");
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // Reset Password State
  const [newPassword, setNewPassword] = useState("");

  // Created/Reset Success Credentials details state
  const [credentialCard, setCredentialCard] = useState<{
    waiterName: string;
    employeeId: string;
    username: string;
    plainPassword: string;
  } | null>(null);

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    fetchWaiters();
  }, []);

  const fetchWaiters = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/waiters");
      if (!res.ok) {
        throw new Error("Failed to load waiters.");
      }
      const data = await res.json();
      setWaiters(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/admin/waiters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, username, password, branchId, restaurantId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create waiter.");
      }

      setWaiters((prev) => [data.waiter, ...prev]);
      setCredentialCard({
        waiterName: data.waiter.name,
        employeeId: data.waiter.employeeId,
        username: data.waiter.username,
        plainPassword: data.plainPassword,
      });

      // Clear form
      setName("");
      setMobile("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to create waiter.");
    }
  };

  const handleEditWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaiter) return;
    setError("");

    try {
      const res = await fetch(`/api/admin/waiters/${selectedWaiter._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, username, branchId, restaurantId, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update waiter.");
      }

      setWaiters((prev) => prev.map((w) => (w._id === selectedWaiter._id ? data : w)));
      setShowEditModal(false);
      setSelectedWaiter(null);
    } catch (err: any) {
      setError(err.message || "Failed to update waiter.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaiter) return;
    setError("");

    try {
      const res = await fetch(`/api/admin/waiters/${selectedWaiter._id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setCredentialCard({
        waiterName: selectedWaiter.name,
        employeeId: data.employeeId,
        username: data.username,
        plainPassword: data.plainPassword,
      });

      setNewPassword("");
      setShowResetModal(false);
      setSelectedWaiter(null);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    }
  };

  const handleToggleStatus = async (waiter: Waiter) => {
    const nextStatus = waiter.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/waiters/${waiter._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to change status.");
      }
      const updated = await res.json();
      setWaiters((prev) => prev.map((w) => (w._id === waiter._id ? updated : w)));
    } catch (err) {
      alert("Error changing status.");
    }
  };

  const handleUnlinkDevice = async (waiter: Waiter) => {
    if (!confirm(`Are you sure you want to unlink device for ${waiter.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/waiters/${waiter._id}/unlink-device`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to unlink device.");
      }
      const data = await res.json();
      setWaiters((prev) => prev.map((w) => (w._id === waiter._id ? data.waiter : w)));
    } catch (err) {
      alert("Error unlinking device.");
    }
  };

  const handleDeleteWaiter = async (waiter: Waiter) => {
    if (!confirm(`Are you sure you want to delete ${waiter.name}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/waiters/${waiter._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete waiter.");
      }
      setWaiters((prev) => prev.filter((w) => w._id !== waiter._id));
    } catch (err) {
      alert("Error deleting waiter.");
    }
  };

  const openEdit = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
    setName(waiter.name);
    setMobile(waiter.mobile);
    setUsername(waiter.username);
    setBranchId(waiter.branchId);
    setRestaurantId(waiter.restaurantId);
    setStatus(waiter.status);
    setShowEditModal(true);
  };

  const openReset = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
    setNewPassword("");
    setShowResetModal(true);
  };

  const getLoginUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/waiter/setup`;
    }
    return "/waiter/setup";
  };

  const buildCredentialShareText = (card: typeof credentialCard) => {
    if (!card) return "";
    return `*WAITER LOGIN DETAILS*\n\nRestaurant: Cafe Milano\nName: ${card.waiterName}\nEmployee ID: ${card.employeeId}\nUsername: ${card.username}\nPassword: ${card.plainPassword}\n\nLogin & Setup URL: ${getLoginUrl()}`;
  };

  const copyToClipboard = (card: typeof credentialCard) => {
    const text = buildCredentialShareText(card);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = (card: typeof credentialCard) => {
    const text = encodeURIComponent(buildCredentialShareText(card));
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="p-1 sm:p-4">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-gold" /> Staff Management
          </h1>
          <p className="text-sm text-muted-foreground">Manage branch waiters, device pairings, and credentials.</p>
        </div>
        <button
          onClick={() => {
            setError("");
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-gold text-gold-foreground px-4 py-2.5 rounded-xl font-semibold shadow-gold hover:scale-[1.02] transition-transform"
        >
          <Plus className="w-4 h-4" /> Create Waiter
        </button>
      </div>

      {/* Main Waiters List Table */}
      <div className="glass-strong rounded-2xl overflow-hidden shadow-card">
        {loading ? (
          <div className="py-12 flex justify-center items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-gold" /> Loading staff details...
          </div>
        ) : waiters.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No waiters registered yet. Click "Create Waiter" to add staff.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-glass border-b border-border text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                  <th className="p-4">Waiter</th>
                  <th className="p-4">Employee ID</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Password</th>
                  <th className="p-4">Branch</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Device</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {waiters.map((waiter) => (
                  <tr key={waiter._id} className="hover:bg-glass/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold">{waiter.name}</div>
                      <div className="text-xs text-muted-foreground">@{waiter.username}</div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-gold">{waiter.employeeId}</td>
                    <td className="p-4">{waiter.mobile}</td>
                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">
                          {visiblePasswords[waiter._id]
                            ? waiter.plainPassword || "—"
                            : "••••"}
                        </span>
                        {waiter.plainPassword && (
                          <button
                            onClick={() => togglePasswordVisibility(waiter._id)}
                            className="p-1 hover:bg-glass rounded text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                            title={visiblePasswords[waiter._id] ? "Hide Password" : "Show Password"}
                          >
                            {visiblePasswords[waiter._id] ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 capitalize">{waiter.branchId.replace("-", " ")}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(waiter)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          waiter.status === "active"
                            ? "bg-success/20 text-success"
                            : "bg-destructive/20 text-destructive"
                        }`}
                        title="Click to toggle status"
                      >
                        {waiter.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-4">
                      {waiter.deviceId ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Smartphone className="w-3.5 h-3.5 text-success" />
                          <span className="font-medium text-foreground max-w-[120px] truncate" title={waiter.deviceName}>
                            {waiter.deviceName || "Paired Device"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No device linked</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEdit(waiter)}
                        className="p-2 hover:bg-glass/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                        title="Edit Waiter"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openReset(waiter)}
                        className="p-2 hover:bg-glass/80 rounded-lg text-muted-foreground hover:text-foreground transition-colors inline-flex items-center"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {waiter.deviceId && (
                        <button
                          onClick={() => handleUnlinkDevice(waiter)}
                          className="p-2 hover:bg-glass/80 rounded-lg text-muted-foreground hover:text-destructive transition-colors inline-flex items-center"
                          title="Unlink Device"
                        >
                          <Link2Off className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteWaiter(waiter)}
                        className="p-2 hover:bg-glass/80 rounded-lg text-muted-foreground hover:text-destructive transition-colors inline-flex items-center"
                        title="Delete Waiter"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credential Success Display Modal overlay */}
      <AnimatePresence>
        {credentialCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-strong rounded-3xl p-6 shadow-elegant border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-success">Waiter Created Successfully</h3>
                <button 
                  onClick={() => setCredentialCard(null)} 
                  className="p-1 hover:bg-glass rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-glass rounded-2xl p-5 border border-border/80 font-mono text-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-gold opacity-[0.05] rounded-bl-full pointer-events-none" />
                
                <p className="text-center font-bold tracking-wide border-b border-border/80 pb-2.5 mb-3 text-gold">
                  WAITER LOGIN DETAILS
                </p>

                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Restaurant:</span>{" "}
                    <span className="font-bold text-foreground">Cafe Milano</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Waiter Name:</span>{" "}
                    <span className="font-bold text-foreground">{credentialCard.waiterName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Waiter ID:</span>{" "}
                    <span className="font-bold text-gold">{credentialCard.employeeId}</span>
                  </div>
                  <div className="border-t border-border/40 my-2 pt-2">
                    <span className="text-muted-foreground">Username:</span>{" "}
                    <span className="font-bold text-foreground">{credentialCard.username}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Password:</span>{" "}
                    <span className="font-bold text-foreground select-all bg-input/50 px-1 py-0.5 rounded">{credentialCard.plainPassword}</span>
                  </div>
                  <div className="border-t border-border/40 pt-2 text-[10px] text-muted-foreground break-all">
                    Login URL: <span className="text-foreground underline">{getLoginUrl()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <button
                  onClick={() => copyToClipboard(credentialCard)}
                  className="flex items-center justify-center gap-2 bg-glass border border-border hover:bg-glass/80 text-foreground py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-success" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy details
                    </>
                  )}
                </button>
                <button
                  onClick={() => shareViaWhatsApp(credentialCard)}
                  className="flex items-center justify-center gap-2 bg-success text-white hover:bg-success/90 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Waiter Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-lg glass-strong rounded-3xl p-6 shadow-elegant border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold">Create Waiter Account</h3>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="p-1 hover:bg-glass rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> {error}
                </div>
              )}

              <form onSubmit={handleCreateWaiter} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Waiter Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. waiter_rahul"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Assigned Branch</label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors capitalize"
                    >
                      <option value="default-branch">Default Branch (Branch A)</option>
                      <option value="branch-b">Branch B</option>
                      <option value="branch-c">Branch C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 hover:bg-glass border border-border rounded-xl font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-gold text-gold-foreground rounded-xl font-semibold shadow-gold hover:scale-[1.01] transition-transform text-sm"
                  >
                    Create Waiter
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Waiter Modal */}
      <AnimatePresence>
        {showEditModal && selectedWaiter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-lg glass-strong rounded-3xl p-6 shadow-elegant border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold">Edit Waiter Details</h3>
                <button 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedWaiter(null);
                  }} 
                  className="p-1 hover:bg-glass rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> {error}
                </div>
              )}

              <form onSubmit={handleEditWaiter} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Waiter Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. waiter_rahul"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Assigned Branch</label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="default-branch">Default Branch (Branch A)</option>
                      <option value="branch-b">Branch B</option>
                      <option value="branch-c">Branch C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedWaiter(null);
                    }}
                    className="px-4 py-2 hover:bg-glass border border-border rounded-xl font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-gold text-gold-foreground rounded-xl font-semibold shadow-gold hover:scale-[1.01] transition-transform text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && selectedWaiter && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-md glass-strong rounded-3xl p-6 shadow-elegant border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold flex items-center gap-2">
                  <Key className="w-5 h-5 text-gold" /> Reset Password
                </h3>
                <button 
                  onClick={() => {
                    setShowResetModal(false);
                    setSelectedWaiter(null);
                  }} 
                  className="p-1 hover:bg-glass rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                Enter a new temporary password for <strong>{selectedWaiter.name} ({selectedWaiter.employeeId})</strong>. 
                They will be forced to change this password on their next login.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setSelectedWaiter(null);
                    }}
                    className="px-4 py-2 hover:bg-glass border border-border rounded-xl font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-gold text-gold-foreground rounded-xl font-semibold shadow-gold hover:scale-[1.01] transition-transform text-sm"
                  >
                    Reset & Force Change
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
