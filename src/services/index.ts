import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Tables = keyof Database["public"]["Tables"];
type TableRow<T extends Tables> = Database["public"]["Tables"][T]["Row"];

type WhereClause = {
  column: string;
  operator?: string;
  value: string | number | boolean | null;
};

export async function listar_tabela<T extends Tables>(
  table: T,
  where?: WhereClause
): Promise<TableRow<T>[]> {
  let query = supabase.from(table).select("*");

  if (where) {
    const { column, operator = "eq", value } = where;
    query = query.filter(column, operator, value);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch ${table}: ${error.message}`);
  }

  return (data ?? []) as TableRow<T>[];
}
