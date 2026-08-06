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
      const fetchSafe = async (url: string) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            return await res.json();
          }
          console.error(`Failed to fetch ${url}: Status ${res.status}`);
          return null;
        } catch (e) {
          console.error(`Failed to fetch ${url}:`, e);
          return null;
        }
      };

      const [menuData, catsData, ordersData, tablesData] = await Promise.all([
        fetchSafe("/api/menu"),
        fetchSafe("/api/categories"),
        fetchSafe("/api/orders"),
        fetchSafe("/api/tables"),
      ]);

      if (menuData) setMenu(menuData);
      if (catsData) setCategories(catsData);
      if (ordersData) setOrders(ordersData);
      if (tablesData) setTables(tablesData);
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
