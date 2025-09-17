import type { Database } from "./supabase"

export type { Database }

export type PublicSchema = Database["public"]
export type Tables = PublicSchema["Tables"]
export type TableName = keyof Tables

export type TableRow<Name extends TableName> = Tables[Name]["Row"]
export type TableInsert<Name extends TableName> = Tables[Name]["Insert"]
export type TableUpdate<Name extends TableName> = Tables[Name]["Update"]

export type Enums = PublicSchema["Enums"]

export type Vehicle = TableRow<"veiculos">
export type VehicleInsert = TableInsert<"veiculos">
export type VehicleUpdate = TableUpdate<"veiculos">

export interface AuthUser {
  id: string
  email?: string
}

export type AuthState = {
  user: AuthUser | null
  token: string | null
  empresaId: string | null
  loading: boolean
  bootstrap: () => Promise<void>
  setEmpresaId: (empresaId: string | null) => void
  refreshEmpresa: () => Promise<void>
  logout: () => Promise<void>
}

export * as Tabelas from "./supabase_tables"
export * as Utils from "./utils"
