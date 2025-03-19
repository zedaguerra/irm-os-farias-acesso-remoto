import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export function useSessionManagement(machineId: string) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: activeSession } = useQuery({
    queryKey: ['active-session', machineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          connection_tokens (
            token,
            status,
            expires_at
          )
        `)
        .eq('machine_id', machineId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const startSession = async (type: 'remote' | 'local') => {
    setLoading(true);
    try {
      // Create new session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          machine_id: machineId,
          status: 'pending',
          connection_type: type
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Generate connection token
      const token = uuidv4().replace(/-/g, '').toUpperCase();
      const { error: tokenError } = await supabase
        .from('connection_tokens')
        .insert({
          session_id: session.id,
          token,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes
        });

      if (tokenError) throw tokenError;

      // Update session status
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ status: 'active' })
        .eq('id', session.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries(['active-session', machineId]);
      toast.success('Session started successfully');
      return token;
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!activeSession) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      queryClient.invalidateQueries(['active-session', machineId]);
      toast.success('Session ended successfully');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  return {
    activeSession,
    loading,
    startSession,
    endSession
  };
}