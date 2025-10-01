import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
type Tables = keyof Database["public"]["Tables"];

export async function listar_tabela<T extends Tables>(table: T): Promise<Database["public"]["Tables"][T]["Row"][]> {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
        throw new Error(`Failed to fetch ${table}: ${error.message}`);
    }
    return data as Database["public"]["Tables"][T]["Row"][];
}

console.log(await listar_tabela("veiculos"));