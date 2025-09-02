import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVersionStore } from "../store/versionStore";
import { supabase } from "../lib/supabaseClient";

interface Todo {
  id: number;
  title: string;
}

export default function Todos( props : {table_name : string}): React.JSX.Element {
  const queryClient = useQueryClient();
  const versions = useVersionStore((s) => s.versions);
  const v = versions[props.table_name] ?? "0";

  // Invalida queries antigas quando a versão mudar
  useEffect(() => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === props.table_name && query.queryKey[1] !== v,
    });
    queryClient.removeQueries({
      predicate: (query) =>
        query.queryKey[0] === props.table_name && query.queryKey[1] !== v,
    });
  }, [v, queryClient]);

  const { data, isLoading, isFetching } = useQuery<Todo[]>({
    queryKey: [props.table_name, v],
    queryFn: async () => {
      console.log("Query atual:", queryClient.getQueryData([props.table_name, v]));
      const { data, error } = await supabase.from("veiculos").select("*");
      if (error) {
        throw new Error("No data found");
      }

      //console.log("Fetched todos from Supabase",data);
      console.log("Queries Ativas:", queryClient.getQueryCache().getAll());

      return data as Todo[];
    },
  });

  return (
    <div>
      <h2>Todos (Versão: {v})</h2>
      <button onClick={() => {console.log("Atualizando versão de todos")}}>
        Atualizar versão de "todos"
      </button>
      <p>{isFetching ? "Buscando..." : "Dados renderizados"}</p>
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <ul>
          {data?.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
