"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { makeQueryClient } from "@/lib/query-client";
import { localStoragePersister } from "@/lib/query-persister";

export function QueryProvider({ children }: PropsWithChildren) {
  // Cria o QueryClient apenas uma vez por componente
  const [queryClient] = useState(() => {
    const client = makeQueryClient();

    // Habilita persistência apenas no cliente
    if (typeof window !== "undefined") {
      persistQueryClient({
        queryClient: client,
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 horas
      });
    }

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Alias para compatibilidade com import existente
export { QueryProvider as ReactQueryProvider };
