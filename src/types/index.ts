<<<<<<< HEAD
﻿import type { Database } from "./supabase";

export type { Database };

export type PublicSchema = Database["public"];
export type Tables = PublicSchema["Tables"];
export type TableName = keyof Tables;

export type TableRow<Name extends TableName> = Tables[Name]["Row"];
export type TableInsert<Name extends TableName> = Tables[Name]["Insert"];
export type TableUpdate<Name extends TableName> = Tables[Name]["Update"];

export type Enums = PublicSchema["Enums"];

export type Vehicle = TableRow<"veiculos">;
export type VehicleInsert = TableInsert<"veiculos">;
export type VehicleUpdate = TableUpdate<"veiculos">;

export interface AuthUser {
  id: string;
  email?: string;
}

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  empresaId: string | null;
  loading: boolean;
  bootstrap: () => Promise<void>;
  setEmpresaId: (empresaId: string | null) => void;
  refreshEmpresa: () => Promise<void>;
  logout: () => Promise<void>;
};
=======
import * as supabase_tables from './supabase_tables';
import * as supabase_auth from './supabase_auth';
import * as utils from './utils';

export { 
    supabase_tables as Tabelas, 
    supabase_auth as Auth,
    utils as Utils
};
>>>>>>> 4a9cd9a764550d3359743d5484686b69da2b76a3
