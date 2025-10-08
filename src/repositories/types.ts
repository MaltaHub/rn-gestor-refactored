/**
 * Tipos e interfaces base para o Repository Pattern
 */

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, any>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface QueryFilter {
  column: string;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
  value: any;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export type RepositoryResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: RepositoryError;
};
