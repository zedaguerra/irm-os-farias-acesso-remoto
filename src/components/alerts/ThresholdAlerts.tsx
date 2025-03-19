import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Bell, Info, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  device_id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

interface ThresholdAlertsProps {
  deviceId: string;
}

export function ThresholdAlerts({ deviceId }: ThresholdAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const { data: thresholds } = useQuery({
    queryKey: ['thresholds', deviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_thresholds')
        .select('*')
        .eq('device_id', deviceId);

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel(`device-metrics-${deviceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'machine_metrics',
        filter: `device_id=eq.${deviceId}`
      }, (payload) => {
        checkThresholds(payload.new);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [deviceId, thresholds]);

  const checkThresholds = (metrics: any) => {
    thresholds?.forEach((threshold) => {
      if (metrics[threshold.metric] > threshold.value) {
        const alert: Alert = {
          id: crypto.randomUUID(),
          device_id: deviceId,
          type: threshold.alert_type,
          message: `${threshold.metric} exceeded threshold: ${metrics[threshold.metric]}%`,
          severity: threshold.severity,
          created_at: new Date().toISOString()
        };

        setAlerts(prev => [alert, ...prev]);
        showAlertNotification(alert);
      }
    });
  };

  const showAlertNotification = (alert: Alert) => {
    const message = `${alert.type.toUpperCase()}: ${alert.message}`;
    switch (alert.severity) {
      case 'high':
        toast.error(message);
        break;
      case 'medium':
        toast.warning(message);
        break;
      default:
        toast.info(message);
    }
  };

  const clearAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Active Alerts</h2>
      <div className="space-y-4">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`flex items-start justify-between p-4 rounded-lg ${
              alert.severity === 'high'
                ? 'bg-red-50'
                : alert.severity === 'medium'
                ? 'bg-yellow-50'
                : 'bg-blue-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              {alert.type === 'error' ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : alert.type === 'warning' ? (
                <Bell className="h-5 w-5 text-yellow-500" />
              ) : (
                <Info className="h-5 w-5 text-blue-500" />
              )}
              <div>
                <p className="font-medium text-gray-900">{alert.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => clearAlert(alert.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No active alerts
          </div>
        )}
      </div>
    </div>
  );
}