"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStore } from "@/lib/store";

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

    const fetchMenuAndCategories = async () => {
      try {
        const [menuRes, catsRes] = await Promise.all([
          fetch("/api/menu"),
          fetch("/api/categories"),
        ]);
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          setMenu(menuData);
        }
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          setCategories(catsData);
        }
      } catch (e) {
        console.error("Failed to load initial menu or categories:", e);
      }
    };

    const init = async () => {
      await Promise.all([verifySession(), fetchMenuAndCategories()]);
      setMounted(true);
    };

    init();
  }, [login, logout, setMenu, setCategories]);

  if (!mounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
