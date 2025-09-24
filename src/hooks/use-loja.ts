import { useEffect, useState } from "react";

import { getGlobalLoja, subscribeToGlobalLoja } from "@/lib/services/core";

export function useGlobalLojaId() {
  const [lojaId, setLojaId] = useState<string | null>(() => getGlobalLoja());

  useEffect(() => {
    const unsubscribe = subscribeToGlobalLoja(setLojaId);
    return () => unsubscribe();
  }, []);

  return lojaId;
}
