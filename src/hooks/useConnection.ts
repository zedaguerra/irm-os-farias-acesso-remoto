import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Connection } from '../types/database';

export function useConnection(deviceId: string | null) {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    // Subscribe to connection changes
    const subscription = supabase
      .channel(`connection-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setConnection(payload.new as Connection);
          } else if (payload.eventType === 'DELETE') {
            setConnection(null);
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchConnection();

    return () => {
      subscription.unsubscribe();
    };
  }, [deviceId]);

  const fetchConnection = async () => {
    if (!deviceId) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('device_id', deviceId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setConnection(data);
    } catch (error) {
      console.error('Error fetching connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (connectionCode: string) => {
    const qrData = JSON.stringify({
      code: connectionCode,
      timestamp: new Date().toISOString(),
    });

    try {
      const { error } = await supabase
        .from('connections')
        .update({ qr_code: qrData })
        .eq('connection_code', connectionCode);

      if (error) throw error;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  return {
    connection,
    loading,
    generateQRCode,
  };
}