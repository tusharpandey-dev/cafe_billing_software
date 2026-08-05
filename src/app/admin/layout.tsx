"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PanelLayout } from "@/components/PanelLayout";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Receipt, ChefHat } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useStore((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth || auth.role !== "admin") {
      router.push("/login");
    }
  }, [auth, router]);

  if (!auth || auth.role !== "admin") return null;

  return (
    <PanelLayout
      title="Admin Panel"
      items={[
        { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: "/admin/orders", label: "Live Orders", icon: <ClipboardList className="w-4 h-4" /> },
        { to: "/kitchen", label: "Kitchen Display", icon: <ChefHat className="w-4 h-4" /> },
        { to: "/admin/menu", label: "Menu", icon: <UtensilsCrossed className="w-4 h-4" /> },
        { to: "/admin/billing", label: "Billing History", icon: <Receipt className="w-4 h-4" /> },
      ]}
    >
      {children}
    </PanelLayout>
  );
}
