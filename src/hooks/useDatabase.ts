import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, query, DatabaseError } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useDatabase() {
  const queryClient = useQueryClient();

  const handleError = useCallback((error: unknown) => {
    if (error instanceof DatabaseError) {
      toast.error(`Database error: ${error.message}`);
    } else {
      toast.error('An unexpected error occurred');
    }
    console.error('Database operation failed:', error);
  }, []);

  const invalidateQueries = useCallback((keys: string[]) => {
    keys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  }, [queryClient]);

  const insert = useCallback(async <T>(
    table: string,
    data: any,
    options?: { invalidate?: string[] }
  ): Promise<T> => {
    try {
      const result = await query(client =>
        client.from(table).insert(data).select().single()
      );

      if (options?.invalidate) {
        invalidateQueries(options.invalidate);
      }

      return result as T;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [invalidateQueries, handleError]);

  const update = useCallback(async <T>(
    table: string,
    id: string,
    data: any,
    options?: { invalidate?: string[] }
  ): Promise<T> => {
    try {
      const result = await query(client =>
        client.from(table).update(data).eq('id', id).select().single()
      );

      if (options?.invalidate) {
        invalidateQueries(options.invalidate);
      }

      return result as T;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [invalidateQueries, handleError]);

  const remove = useCallback(async (
    table: string,
    id: string,
    options?: { invalidate?: string[] }
  ): Promise<void> => {
    try {
      await query(client =>
        client.from(table).delete().eq('id', id)
      );

      if (options?.invalidate) {
        invalidateQueries(options.invalidate);
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [invalidateQueries, handleError]);

  const subscribe = useCallback((
    table: string,
    callback: (payload: any) => void,
    filter?: { column: string; value: any }
  ) => {
    let query = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table
      }, callback);

    if (filter) {
      query = query.filter('column', 'eq', filter.column, filter.value);
    }

    const subscription = query.subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    insert,
    update,
    remove,
    subscribe
  };
}