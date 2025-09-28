import { ensureClient } from "@supabase/supabase-js";

export function createBrowserClient(...args: unknown[]) {
  void args;
  return ensureClient();
}
