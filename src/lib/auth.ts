import { supabase } from './supabase';
import { captureError } from './monitoring';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  token: z.string()
});

export async function signIn(email: string, password: string) {
  try {
    loginSchema.parse({ email, password });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  } catch (error) {
    captureError(error as Error, { context: 'signIn' });
    throw error;
  }
}

export async function signUp(email: string, password: string) {
  try {
    loginSchema.parse({ email, password });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    captureError(error as Error, { context: 'signUp' });
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    resetPasswordSchema.parse({ email });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    if (error) throw error;
  } catch (error) {
    captureError(error as Error, { context: 'resetPassword' });
    throw error;
  }
}

export async function updatePassword(password: string, token: string) {
  try {
    updatePasswordSchema.parse({ password, token });

    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;
  } catch (error) {
    captureError(error as Error, { context: 'updatePassword' });
    throw error;
  }
}

export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session || error) {
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      return data.session;
    }

    return session;
  } catch (error) {
    captureError(error as Error, { context: 'refreshSession' });
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    captureError(error as Error, { context: 'signOut' });
    throw error;
  }
}