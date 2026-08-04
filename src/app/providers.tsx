"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import Script from "next/script";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);
  const login = useStore((s) => s.login);
  const logout = useStore((s) => s.logout);
  const setMenu = useStore((s) => s.setMenu);
  const setCategories = useStore((s) => s.setCategories);
  const setOrders = useStore((s) => s.setOrders);
  const setTables = useStore((s) => s.setTables);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            login(data.user);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (e) {
        console.error("Failed to verify session:", e);
        logout();
      }
    };

    const fetchInitialData = async () => {
      try {
        const [menuRes, catsRes, ordersRes, tablesRes] = await Promise.all([
          fetch("/api/menu"),
          fetch("/api/categories"),
          fetch("/api/orders"),
          fetch("/api/tables"),
        ]);
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenu(menuData);
        }
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
        }
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
        if (tablesRes.ok) {
          const tablesData = await tablesRes.json();
          setTables(tablesData);
        }
      } catch (e) {
        console.error("Failed to load initial data from database:", e);
      }
    };

    let intervalId: NodeJS.Timeout;

    const init = async () => {
      await Promise.all([verifySession(), fetchInitialData()]);
      setMounted(true);
      // Start polling every 5 seconds to sync data (orders, menu, categories) across client terminals
      intervalId = setInterval(fetchInitialData, 5000);
    };

    init();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [login, logout, setMenu, setCategories, setOrders, setTables]);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </QueryClientProvider>
  );
}
