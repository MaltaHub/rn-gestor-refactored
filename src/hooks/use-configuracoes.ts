import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteCaracteristica,
  deleteLocal,
  deleteLoja,
  deleteModelo,
  deletePlataforma,
  listConfiguracoes,
  saveCaracteristica,
  saveLocal,
  saveLoja,
  saveModelo,
  savePlataforma,
  type ConfiguracoesSnapshot,
} from "@/services/configuracoes";
import type {
  Caracteristica,
  Local,
  Loja,
  Modelo,
  Plataforma,
} from "@/types/supabase";

const configuracoesKeys = {
  all: ["configuracoes"] as const,
  snapshot: () => ["configuracoes", "snapshot"] as const,
};

type MutationSuccessHandler<T> = (entity: T) => void;

type RemoveSuccessHandler = (id: string) => void;

type Identifiable = { id?: string | null };

const updateSnapshotAfterSave = <T extends keyof ConfiguracoesSnapshot>(
  queryClient: ReturnType<typeof useQueryClient>,
  key: T,
): MutationSuccessHandler<ConfiguracoesSnapshot[T][number]> => {
  return (entity) => {
    queryClient.setQueryData<ConfiguracoesSnapshot>(
      configuracoesKeys.snapshot(),
      (previous) => {
        if (!previous) {
          return previous;
        }

        const items = previous[key] as ConfiguracoesSnapshot[T];
        const identifiableEntity = entity as Identifiable;
        const nextItems = [...items];
        const index = nextItems.findIndex((item) => {
          return (item as Identifiable).id === identifiableEntity.id;
        });

        if (index >= 0) {
          nextItems[index] = entity;
        } else {
          nextItems.push(entity);
        }

        return { ...previous, [key]: nextItems } as ConfiguracoesSnapshot;
      },
    );
  };
};

const updateSnapshotAfterDelete = (
  queryClient: ReturnType<typeof useQueryClient>,
  key: keyof ConfiguracoesSnapshot,
): RemoveSuccessHandler => {
  return (id) => {
    queryClient.setQueryData<ConfiguracoesSnapshot>(
      configuracoesKeys.snapshot(),
      (previous) => {
        if (!previous) {
          return previous;
        }

        const filtered = previous[key].filter((item) => (item as Identifiable).id !== id);
        return { ...previous, [key]: filtered } as ConfiguracoesSnapshot;
      },
    );
  };
};

export function useConfiguracoesSnapshot() {
  return useQuery({
    queryKey: configuracoesKeys.snapshot(),
    queryFn: listConfiguracoes,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveLoja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveLoja,
    onSuccess: (loja: Loja) => {
      updateSnapshotAfterSave(queryClient, "lojas")(loja);
    },
  });
}

export function useDeleteLoja() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLoja,
    onSuccess: (_: void, id) => {
      updateSnapshotAfterDelete(queryClient, "lojas")(id);
    },
  });
}

export function useSavePlataforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: savePlataforma,
    onSuccess: (plataforma: Plataforma) => {
      updateSnapshotAfterSave(queryClient, "plataformas")(plataforma);
    },
  });
}

export function useDeletePlataforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlataforma,
    onSuccess: (_: void, id) => {
      updateSnapshotAfterDelete(queryClient, "plataformas")(id);
    },
  });
}

export function useSaveCaracteristica() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveCaracteristica,
    onSuccess: (caracteristica: Caracteristica) => {
      updateSnapshotAfterSave(queryClient, "caracteristicas")(caracteristica);
    },
  });
}

export function useDeleteCaracteristica() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCaracteristica,
    onSuccess: (_: void, id) => {
      updateSnapshotAfterDelete(queryClient, "caracteristicas")(id);
    },
  });
}

export function useSaveModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveModelo,
    onSuccess: (modelo: Modelo) => {
      updateSnapshotAfterSave(queryClient, "modelos")(modelo);
    },
  });
}

export function useDeleteModelo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteModelo,
    onSuccess: (_: void, id) => {
      updateSnapshotAfterDelete(queryClient, "modelos")(id);
    },
  });
}

export function useSaveLocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveLocal,
    onSuccess: (local: Local) => {
      updateSnapshotAfterSave(queryClient, "locais")(local);
    },
  });
}

export function useDeleteLocal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLocal,
    onSuccess: (_: void, id) => {
      updateSnapshotAfterDelete(queryClient, "locais")(id);
    },
  });
}
