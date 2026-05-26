"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthStore } from "@/lib/store/auth";
import { ThemeProvider } from "@/contexts/ThemeContext";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const validateToken = useAuthStore((s) => s.validateToken);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthInitializer>
          {children}
        </AuthInitializer>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--bg-elevated)",
              color: "var(--text)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
