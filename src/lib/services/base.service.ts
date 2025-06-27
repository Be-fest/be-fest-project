import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export class BaseService {
  protected supabase: SupabaseClient<Database>;
  protected table: string;

  constructor(supabase: SupabaseClient<Database>, table: string) {
    this.supabase = supabase;
    this.table = table;
  }

  protected async handleError<T>(query: unknown): Promise<T | null> {
    try {
      const { data, error } = await (query as Promise<{ data: T | null; error: unknown }>);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error in ${this.table} service:`, error);
      throw error;
    }
  }

  async getById<T>(id: string): Promise<T | null> {
    return this.handleError<T>(
      this.supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single()
    );
  }

  async getAll<T>(query?: {
    select?: string;
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    page?: number;
  }): Promise<T[]> {
    let supabaseQuery = this.supabase.from(this.table).select(query?.select || '*');

    if (query?.filters) {
      Object.entries(query.filters).forEach(([key, value]) => {
        supabaseQuery = supabaseQuery.eq(key, value);
      });
    }

    if (query?.orderBy) {
      supabaseQuery = supabaseQuery.order(query.orderBy.column, {
        ascending: query.orderBy.ascending ?? true
      });
    }

    if (query?.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }

    if (query?.page && query?.limit) {
      supabaseQuery = supabaseQuery.range(
        (query.page - 1) * query.limit,
        query.page * query.limit - 1
      );
    }

    const result = await this.handleError<T[]>(supabaseQuery);
    return result || [];
  }

  async create<T, U>(data: U): Promise<T | null> {
    return this.handleError<T>(
      this.supabase
        .from(this.table)
        .insert(data)
        .select()
        .single()
    );
  }

  async update<T, U>(id: string, data: U): Promise<T | null> {
    return this.handleError<T>(
      this.supabase
        .from(this.table)
        .update(data)
        .eq('id', id)
        .select()
        .single()
    );
  }

  async delete(id: string): Promise<void> {
    await this.handleError<null>(
      this.supabase
        .from(this.table)
        .delete()
        .eq('id', id)
    );
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.handleError<{ count: number }>(
      this.supabase
        .from(this.table)
        .select('*', { count: 'exact', head: true })
        .eq('id', id)
    );
    return result?.count === 1;
  }
}