import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { DeviceMetrics } from '../types/database';

export function useDeviceMetrics(deviceId: string) {
  const [metrics, setMetrics] = useState<DeviceMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial metrics
    fetchMetrics();

    // Subscribe to real-time metrics updates
    const subscription = supabase
      .channel(`device-metrics-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'device_metrics',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          setMetrics((current) => [...current, payload.new as DeviceMetrics].slice(-60));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [deviceId]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('device_metrics')
        .select('*')
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false })
        .limit(60);

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching device metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading };
}