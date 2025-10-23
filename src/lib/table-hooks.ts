"use client";

import { supabase } from "./supabase-client";
import { Database } from "src/types/supabase";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseInfiniteQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";

/* ==============================
 * Tipos base
 * ============================== */
type Tables = Database["public"]["Tables"];
export type TableName = keyof Tables;

type Row<K extends TableName> = Tables[K]["Row"];
type Insert<K extends TableName> = Tables[K]["Insert"];
type Update<K extends TableName> = Tables[K]["Update"];

/* ==============================
 * Tipos de filtro e paginação
 * ============================== */
export type Operator =
  | "eq" | "neq" | "lt" | "lte" | "gt" | "gte"
  | "ilike" | "like"
  | "contains" | "containedBy" | "overlaps"
  | "is" | "in";

export type ColumnFilter<K extends TableName> = {
  column: keyof Row<K> & string;
  op: Operator;
  value: Row<K>[keyof Row<K>] | Row<K>[keyof Row<K>][] | null;
};

export type OrderBy<K extends TableName> = {
  column: keyof Row<K> & string;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type Pagination = { page?: number; pageSize?: number };
export type SelectShape = string | undefined;

export type PageResult<T> = {
  rows: T[];
  count: number | null;
  page: number;
  pageSize: number;
  pageCount: number | null;
};

/* ==============================
 * Utils
 * ============================== */
const pageToRange = (page = 1, pageSize = 20) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
};

/* ==============================
 * Filtro universal
 * ============================== */
type FilterOps = {
  eq: (column: string, value: unknown) => unknown;
  neq: (column: string, value: unknown) => unknown;
  lt: (column: string, value: unknown) => unknown;
  lte: (column: string, value: unknown) => unknown;
  gt: (column: string, value: unknown) => unknown;
  gte: (column: string, value: unknown) => unknown;
  like: (column: string, pattern: string) => unknown;
  ilike: (column: string, pattern: string) => unknown;
  contains: (
    column: string,
    value: string | readonly unknown[] | Record<string, unknown>
  ) => unknown;
  containedBy: (
    column: string,
    value: string | readonly unknown[] | Record<string, unknown>
  ) => unknown;
  overlaps: (column: string, value: string | readonly unknown[]) => unknown;
  is: (column: string, value: boolean | null) => unknown;
  in: (column: string, values: readonly unknown[]) => unknown;
};

function applyFilter<K extends TableName>(
  q: unknown,
  f: ColumnFilter<K>
): unknown {
  const { column, op, value } = f;
  const qb = q as FilterOps;
  switch (op) {
    case "eq": return qb.eq(column, value as unknown);
    case "neq": return qb.neq(column, value as unknown);
    case "lt": return qb.lt(column, value as unknown);
    case "lte": return qb.lte(column, value as unknown);
    case "gt": return qb.gt(column, value as unknown);
    case "gte": return qb.gte(column, value as unknown);
    case "like": return qb.like(column, String(value));
    case "ilike": return qb.ilike(column, String(value));
    case "contains":
      return qb.contains(
        column,
        (value as string | readonly unknown[] | Record<string, unknown>)
      );
    case "containedBy":
      return qb.containedBy(
        column,
        (value as string | readonly unknown[] | Record<string, unknown>)
      );
    case "overlaps":
      return qb.overlaps(column, value as string | readonly unknown[]);
    case "is": return qb.is(column, (value as unknown) as boolean | null);
    case "in": {
      const arr = Array.isArray(value) ? value : [value];
      return qb.in(column, arr as readonly unknown[]);
    }
  }
}

/* ==============================
 * Configuração
 * ============================== */
export type SoftDeleteConfig<K extends TableName> = {
  column: keyof Row<K> & string;
  value?: null | boolean;
};

export type TableHooksConfig<K extends TableName> = {
  table: K;
  pk?: keyof Row<K> & string;
  defaultSelect?: SelectShape;
  defaultOrderBy?: OrderBy<K> | OrderBy<K>[];
  fixedFilters?: ColumnFilter<K>[];
  softDelete?: SoftDeleteConfig<K>;
  defaultPageSize?: number;
};

export type ListArgs<K extends TableName> = {
  select?: SelectShape;
  filters?: ColumnFilter<K>[];
  orderBy?: OrderBy<K> | OrderBy<K>[];
  pagination?: Pagination;
  withCount?: boolean;
};

export type InfiniteArgs<K extends TableName> = {
  select?: SelectShape;
  filters?: ColumnFilter<K>[];
  orderBy?: OrderBy<K> | OrderBy<K>[];
  pageSize?: number;
  withCount?: boolean;
};

/* ==============================
 * Fábrica de hooks por tabela
 * ============================== */
export function useTableHooks<K extends TableName>(cfg: TableHooksConfig<K>) {
  const {
    table,
    pk = "id" as keyof Row<K> & string,
    defaultSelect,
    defaultOrderBy,
    fixedFilters = [],
    softDelete,
    defaultPageSize = 20,
  } = cfg;

  const queryClient = useQueryClient();

  const withFixed = (filters?: ColumnFilter<K>[]) => {
    const merged = [...fixedFilters, ...(filters ?? [])];
    if (softDelete) {
      const sdValue = softDelete.value === undefined ? null : softDelete.value;
      const sd: ColumnFilter<K> = {
        column: softDelete.column,
        op: softDelete.value === undefined ? "is" : "eq",
        value: sdValue as ColumnFilter<K>["value"],
      };
      merged.push(sd);
    }
    return merged.filter(f => f.value !== undefined);
  };

  const buildQuery = (args: {
    select?: SelectShape;
    filters?: ColumnFilter<K>[];
    orderBy?: OrderBy<K> | OrderBy<K>[];
    pagination?: Pagination;
    withCount?: boolean;
  }) => {
    const { select, filters, orderBy, pagination, withCount } = args;

    let q = supabase
      .from(table)
      .select(select ?? defaultSelect ?? "*", { count: withCount ? "exact" : undefined });

    for (const f of withFixed(filters)) q = applyFilter(q, f) as typeof q;

    const orderList = Array.isArray(orderBy ?? defaultOrderBy)
      ? (orderBy ?? defaultOrderBy) as OrderBy<K>[]
      : orderBy
      ? [orderBy as OrderBy<K>]
      : [];

    for (const ord of orderList) {
      q = q.order(ord.column, {
        ascending: ord.ascending ?? true,
        nullsFirst: ord.nullsFirst,
      });
    }

    if (pagination) {
      const { from, to } = pageToRange(pagination.page, pagination.pageSize ?? defaultPageSize);
      q = q.range(from, to);
    }

    return q;
  };

  /* ==============================
   * Hooks CRUD e Listagem
   * ============================== */
  function useList(args?: ListArgs<K>): UseQueryResult<PageResult<Row<K>>> {
    const {
      select,
      filters,
      orderBy,
      pagination = { page: 1, pageSize: defaultPageSize },
      withCount = false, // ✅ performance
    } = args ?? {};

    const key = ["t", table, "list", { select, filters, orderBy, pagination, withCount, fixedFilters, softDelete }] as const;

    return useQuery({
      queryKey: key,
      queryFn: async () => {
        const { data, error, count } = await buildQuery({
          select, filters, orderBy, pagination, withCount,
        });
        if (error) throw error;

        const total = count ?? null;
        const page = pagination.page ?? 1;
        const pageSize = pagination.pageSize ?? defaultPageSize;
        const pageCount = total != null ? Math.ceil(total / pageSize) : null;

        return {
          rows: (data ?? []) as unknown as Row<K>[],
          count: total,
          page,
          pageSize,
          pageCount,
        };
      },
      staleTime: 15_000,
    });
  }

  function useInfinite(args?: InfiniteArgs<K>): UseInfiniteQueryResult<PageResult<Row<K>>> {
    const {
      select,
      filters,
      orderBy,
      pageSize = defaultPageSize,
      withCount = false,
    } = args ?? {};

    const key = ["t", table, "inf", { select, filters, orderBy, pageSize, withCount, fixedFilters, softDelete }] as const;

    return useInfiniteQuery({
      queryKey: key,
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const page = Number(pageParam) || 1;
        const { data, error, count } = await buildQuery({
          select,
          filters,
          orderBy,
          pagination: { page, pageSize },
          withCount,
        });
        if (error) throw error;

        const total = count ?? null;
        const pageCount = total != null ? Math.ceil(total / pageSize) : null;

        return {
          rows: (data ?? []) as unknown as Row<K>[],
          count: total,
          page,
          pageSize,
          pageCount,
        };
      },
      getNextPageParam: (last) =>
        last.pageCount == null
          ? last.rows.length < last.pageSize
            ? undefined
            : last.page + 1
          : last.page < last.pageCount
          ? last.page + 1
          : undefined,
      staleTime: 15_000,
    });
  }

  function useById(id: Row<K>[typeof pk] | string | number): UseQueryResult<Row<K> | null> {
    const key = ["t", table, "byId", id, { fixedFilters, softDelete }] as const;

    return useQuery({
      queryKey: key,
      enabled: id != null,
      queryFn: async () => {
        let q = supabase.from(table).select(defaultSelect ?? "*");
        for (const f of withFixed([])) q = applyFilter(q, f) as typeof q;
        const { data, error } = await q.eq(pk as string, id as unknown).maybeSingle();
        if (error) throw error;
        return (data ?? null) as Row<K> | null;
      },
    });
  }

  function useInsert(): UseMutationResult<Row<K>[], Error, Insert<K>> {
    return useMutation({
      mutationFn: async (payload) => {
        const { data, error } = await supabase.from(table).insert(payload).select(defaultSelect ?? "*");
        if (error) throw error;
        return (data ?? []) as unknown as Row<K>[];
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["t", table] }),
    });
  }

  function useUpdate(): UseMutationResult<
    Row<K>[],
    Error,
    { id: Row<K>[typeof pk] | string | number; changes: Update<K> }
  > {
    return useMutation({
      mutationFn: async ({ id, changes }) => {
        const { data, error } = await supabase
          .from(table)
          .update(changes)
          .eq(pk as string, id as unknown)
          .select(defaultSelect ?? "*");
        if (error) throw error;
        return (data ?? []) as unknown as Row<K>[];
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["t", table] }),
    });
  }

  function useDelete(): UseMutationResult<
    Row<K>[],
    Error,
    { id: Row<K>[typeof pk] | string | number }
  > {
    return useMutation({
      mutationFn: async ({ id }) => {
        if (softDelete) {
          const sdChanges =
            softDelete.value === undefined
              ? { [softDelete.column]: new Date().toISOString() }
              : { [softDelete.column]: softDelete.value };

          const { data, error } = await supabase
            .from(table)
            .update(sdChanges as Partial<Update<K>>)
            .eq(pk as string, id as unknown)
            .select(defaultSelect ?? "*");

          if (error) throw error;
          return (data ?? []) as unknown as Row<K>[];
        }

        const { data, error } = await supabase
          .from(table)
          .delete()
          .eq(pk as string, id as unknown)
          .select(defaultSelect ?? "*");

        if (error) throw error;
        return (data ?? []) as unknown as Row<K>[];
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["t", table] }),
    });
  }

  return { table, pk, useList, useInfinite, useById, useInsert, useUpdate, useDelete };
}
