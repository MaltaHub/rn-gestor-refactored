import { create } from "zustand"

import { supabase } from "@/lib/supabaseClient"
import type { Database } from "@/types"

export type VersionRow = { table_name: string; version: string }
export type VersionMap = Record<string, string>

interface VersionStore {
  versions: VersionMap
  loadFromStorage: () => void
}

const STORAGE_KEY = "app_versions"
const VERSION_TABLE = "versions" as const

type PublicTable = keyof Database["public"]["Tables"]

type VersionQueryResult = { data: VersionRow[] | null; error: Error | null }

export const useVersionStore = create<VersionStore>((set) => ({
  versions: {},
  loadFromStorage: () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      set({ versions: {} })
      return
    }

    try {
      const parsed = JSON.parse(raw) as VersionMap
      set({ versions: parsed })
    } catch {
      set({ versions: {} })
    }
  },
}))

function mapFromRows(rows: VersionRow[] = []): VersionMap {
  return rows.reduce<VersionMap>((accumulator, row) => {
    accumulator[row.table_name] = String(row.version)
    return accumulator
  }, {})
}

function mapsEqual(a: VersionMap, b: VersionMap): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every((key) => a[key] === b[key])
}

export class VersionManager {
  private intervalMs: number
  private timerId: number | null = null
  private lastSaved: VersionMap = {}
  private fetching = false
  private readonly tableName: typeof VERSION_TABLE = VERSION_TABLE

  constructor(intervalMs = 5000) {
    this.intervalMs = intervalMs
    useVersionStore.getState().loadFromStorage()
    try {
      this.lastSaved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    } catch {
      this.lastSaved = {}
    }
  }

  setIntervalMs(ms: number) {
    this.intervalMs = ms
    if (!this.timerId) return
    this.stop()
    this.start()
  }

  start() {
    if (this.timerId) return
    void this.tick()
    this.timerId = window.setInterval(() => {
      void this.tick()
    }, this.intervalMs)
  }

  stop() {
    if (!this.timerId) return
    window.clearInterval(this.timerId)
    this.timerId = null
  }

  async tick() {
    if (this.fetching) return
    this.fetching = true

    try {
      const relation = this.tableName as unknown as PublicTable
      const response = (await supabase.from(relation as never).select("table_name, version")) as VersionQueryResult

      if (response.error) {
        console.error("[VersionManager] fetch error:", response.error)
        return
      }

      const rows = response.data ?? []
      const next = mapFromRows(rows)
      const current = useVersionStore.getState().versions

      if (!mapsEqual(current, next)) {
        useVersionStore.setState({ versions: next })
      }

      if (!mapsEqual(this.lastSaved, next)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        this.lastSaved = { ...next }
        console.log("[VersionManager] versions updated:", next)
      }
    } finally {
      this.fetching = false
    }
  }
}
