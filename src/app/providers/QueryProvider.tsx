"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutos - dados são considerados frescos
            gcTime: 5 * 60 * 1000, // 5 minutos - quanto tempo fica em cache após não ser usado (v5 renamed from cacheTime)
            refetchOnWindowFocus: true, // Refetch ao voltar para a aba
            retry: 1, // Tenta novamente 1 vez em caso de erro
          },
          mutations: {
            retry: 0, // Não tenta novamente mutations automaticamente
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
