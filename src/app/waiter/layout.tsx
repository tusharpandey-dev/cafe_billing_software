"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PanelLayout } from "@/components/PanelLayout";
import { ShoppingBag, ClipboardList } from "lucide-react";

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  const auth = useStore((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth || auth.role !== "waiter") {
      router.push("/login");
    }
  }, [auth, router]);

  if (!auth || auth.role !== "waiter") return null;

  return (
    <PanelLayout
      title="Waiter Panel"
      items={[
        { to: "/waiter", label: "New Order", icon: <ShoppingBag className="w-4 h-4" /> },
        { to: "/waiter/orders", label: "My Orders", icon: <ClipboardList className="w-4 h-4" /> },
      ]}
    >
      {children}
    </PanelLayout>
  );
}
