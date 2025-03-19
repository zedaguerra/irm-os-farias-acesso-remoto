import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Connection } from '../types/database';

export function useRemoteSession(deviceId: string) {
  const [session, setSession] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active session
    fetchSession();

    // Subscribe to session changes
    const subscription = supabase
      .channel(`remote-session-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'remote_sessions',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setSession(payload.new as Connection);
          } else if (payload.eventType === 'DELETE') {
            setSession(null);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [deviceId]);

  const fetchSession = async () => {
    try {
      const { data, error } = await supabase
        .from('remote_sessions')
        .select('*')
        .eq('device_id', deviceId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSession(data);
    } catch (error) {
      console.error('Error fetching remote session:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (options: {
    quality_level: 'low' | 'medium' | 'high';
    features_enabled: string[];
    session_recording: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('remote_sessions')
        .insert([
          {
            device_id: deviceId,
            status: 'active',
            ...options,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting remote session:', error);
      throw error;
    }
  };

  const endSession = async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('remote_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error ending remote session:', error);
      throw error;
    }
  };

  return {
    session,
    loading,
    startSession,
    endSession,
  };
}