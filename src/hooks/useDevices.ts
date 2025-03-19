import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import type { Device, Connection } from '../types/database';

export function useDevices(userId: string | undefined) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to devices changes
    const subscription = supabase
      .channel('devices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDevices((current) => [...current, payload.new as Device]);
          } else if (payload.eventType === 'UPDATE') {
            setDevices((current) =>
              current.map((device) =>
                device.id === payload.new.id ? (payload.new as Device) : device
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDevices((current) =>
              current.filter((device) => device.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchDevices();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDevice = async (deviceData: Omit<Device, 'id' | 'user_id' | 'created_at' | 'last_connection' | 'online'>) => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .insert([{ ...deviceData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating device:', error);
      throw error;
    }
  };

  const createConnection = async (deviceId: string) => {
    try {
      const connectionCode = uuidv4().split('-')[0].toUpperCase();
      const { data, error } = await supabase
        .from('connections')
        .insert([
          {
            device_id: deviceId,
            connection_code: connectionCode,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Connection;
    } catch (error) {
      console.error('Error creating connection:', error);
      throw error;
    }
  };

  const updateDeviceStatus = async (deviceId: string, online: boolean) => {
    try {
      const { error } = await supabase
        .from('devices')
        .update({ online, last_connection: new Date().toISOString() })
        .eq('id', deviceId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating device status:', error);
      throw error;
    }
  };

  return {
    devices,
    loading,
    createDevice,
    createConnection,
    updateDeviceStatus,
  };
}