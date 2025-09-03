// version-monolith.ts (exemplo de arquivo único)
import { create } from "zustand";
import { supabase } from "../lib/supabaseClient"; // ajuste o import para seu projeto

// tipos simples
export type VersionRow = { table_name: string; version: string };
export type VersionMap = Record<string, string>;

// ---------- Zustand store (somente versões públicas) ----------
interface VersionStore {
  versions: VersionMap;
  loadFromStorage: () => void;
}

// chave para localStorage
const STORAGE_KEY = "app_versions";

export const useVersionStore = create<VersionStore>((set) => ({
  versions: {},
  loadFromStorage: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return set({ versions: {} });
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      set({ versions: parsed });
    } catch {
      set({ versions: {} });
    }
  },
}));

// ---------- util simples ----------
function mapFromRows(rows: VersionRow[] = []): VersionMap {
  const out: VersionMap = {};
  for (const r of rows) out[r.table_name] = String(r.version);
  return out;
}
function mapsEqual(a: VersionMap, b: VersionMap): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) if (a[k] !== b[k]) return false;
  return true;
}

// ---------- VersionManager (POO, simples) ----------
export class VersionManager {
  private intervalMs: number;
  private timerId: number | null = null;
  private lastSaved: VersionMap = {};
  private fetching = false;
  private tableName = "versions";

  constructor(intervalMs = 5000) {
    this.intervalMs = intervalMs;
    // hydrate store from localStorage immediately
    useVersionStore.getState().loadFromStorage();
    this.lastSaved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  }

  setIntervalMs(ms: number) {
    this.intervalMs = ms;
    if (this.timerId) {
      this.stop();
      this.start();
    }
  }

  start() {
    if (this.timerId) return; // idempotente
    // run immediately
    void this.tick();
    this.timerId = window.setInterval(() => void this.tick(), this.intervalMs);
  }

  stop() {
    if (!this.timerId) return;
    clearInterval(this.timerId);
    this.timerId = null;
  }

  // fetch once and process
  async tick() {
    if (this.fetching) return;
    this.fetching = true;
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("table_name, version");
      if (error) {
        console.error("[VersionManager] fetch error:", error);
        return;
      }

      // transformar em map
      const next = mapFromRows((data ?? []) as VersionRow[]);
      const current = useVersionStore.getState().versions;

      // se mudou em relação ao store -> publicar
      if (!mapsEqual(current, next)) {
        useVersionStore.getState().loadFromStorage(); // ensure we don't overwrite local changes unexpectedly
        useVersionStore.getState().loadFromStorage(); // keep idempotent (safe)
        // publish directly
        useVersionStore.setState({ versions: next });
      }

      // só salvar no localStorage se diferente do último save
      if (!mapsEqual(this.lastSaved, next)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        this.lastSaved = { ...next };
        
        console.log("[VersionManager] versions updated:", next);
      }
    } finally {
      this.fetching = false;
    }
  }
}

/*
const vm = new VersionManager(5000); // 5s por padrão
vm.start();

// @ts-ignore
window.__versionManager = vm;
*/