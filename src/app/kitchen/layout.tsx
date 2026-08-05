"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PanelLayout } from "@/components/PanelLayout";
import { ChefHat, History } from "lucide-react";

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  const auth = useStore((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!auth || (auth.role !== "kitchen" && auth.role !== "admin")) {
      router.push("/login");
    }
  }, [auth, router]);

  if (!auth || (auth.role !== "kitchen" && auth.role !== "admin")) return null;

  return (
    <PanelLayout
      title="Kitchen Screen (KDS)"
      items={[
        { to: "/kitchen", label: "Live Display Board", icon: <ChefHat className="w-4 h-4" /> },
        { to: "/kitchen/history", label: "Kitchen History", icon: <History className="w-4 h-4" /> },
      ]}
    >
      {children}
    </PanelLayout>
  );
}
