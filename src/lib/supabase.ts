import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database error handler
export class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Type-safe database query wrapper
export async function query<T>(
  callback: (client: typeof supabase) => Promise<{
    data: T | null;
    error: any;
  }>
): Promise<T> {
  try {
    const { data, error } = await callback(supabase);
    
    if (error) {
      throw new DatabaseError(error.message, error.code);
    }
    
    if (!data) {
      throw new DatabaseError('No data returned from query');
    }
    
    return data;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError('An unexpected database error occurred');
  }
}