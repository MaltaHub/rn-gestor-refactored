import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVersionStore } from "../store/versionStore";
import { supabase } from "../lib/supabaseClient";

interface Todo {
  id: number;
  title: string;
}

export default function Todos() {
  const queryClient = useQueryClient();
  const version = useVersionStore((state) => state.versions.todos);
  const updateVersion = useVersionStore((state) => state.updateVersion);

  // Invalida queries antigas quando a versão mudar
  useEffect(() => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "todos" && query.queryKey[1] !== version,
    });
    queryClient.removeQueries({
      predicate: (query) =>
        query.queryKey[0] === "todos" && query.queryKey[1] !== version,
    });
  }, [version, queryClient]);

  const { data, isLoading, isFetching } = useQuery<Todo[]>({
    queryKey: ["todos", version],
    queryFn: async () => {
      const { data, error } = await supabase.from("veiculos").select("*");
      if (error) {
        throw new Error("No data found");
      }

      //console.log("Fetched todos from Supabase",data);
      console.log("Queries Ativas:", queryClient.getQueriesData);

      return data as Todo[];
    },
  });

  return (
    <div>
      <h2>Todos (Versão: {version})</h2>
      <button onClick={() => updateVersion("todos")}>
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
