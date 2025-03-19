import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Alert } from '../types/database';
import toast from 'react-hot-toast';

export function useAlerts(deviceId: string) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel(`alerts-${deviceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `device_id=eq.${deviceId}`,
      }, (payload) => {
        const newAlert = payload.new as Alert;
        setAlerts((prev) => [newAlert, ...prev]);
        
        // Show toast notification for new alerts
        const toastMessage = `${newAlert.type.toUpperCase()}: ${newAlert.message}`;
        switch (newAlert.severity) {
          case 'high':
            toast.error(toastMessage);
            break;
          case 'medium':
            toast.warning(toastMessage);
            break;
          default:
            toast.info(toastMessage);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [deviceId]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', alertId);

      if (error) throw error;
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const clearAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (error) {
      console.error('Error clearing alert:', error);
    }
  };

  return {
    alerts,
    loading,
    markAsRead,
    clearAlert,
  };
}