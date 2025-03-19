import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export function useSession(machineId: string) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: activeSession } = useQuery({
    queryKey: ['machine-session', machineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machine_sessions')
        .select('*')
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
      // Create connection token
      const token = uuidv4().replace(/-/g, '').toUpperCase();
      const { error: tokenError } = await supabase
        .from('connection_tokens')
        .insert({
          machine_id: machineId,
          token,
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 60000).toISOString() // 30 minutes
        });

      if (tokenError) throw tokenError;

      // Create session
      const { error: sessionError } = await supabase
        .from('machine_sessions')
        .insert({
          machine_id: machineId,
          status: 'active',
          connection_type: type,
          metadata: { connection_token: token }
        });

      if (sessionError) throw sessionError;

      queryClient.invalidateQueries(['machine-session', machineId]);
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
        .from('machine_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      queryClient.invalidateQueries(['machine-session', machineId]);
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