import { supabase } from './supabase';
import type { Machine } from '../types/database';

export class MachineControl {
  async getMachineStatus(machineId: string): Promise<Machine | null> {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('id', machineId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting machine status:', error);
      return null;
    }
  }

  async updateMachineStatus(machineId: string, status: 'active' | 'inactive' | 'maintenance'): Promise<void> {
    try {
      const { error } = await supabase
        .from('machines')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', machineId);

      if (error) throw error;

      await this.logMachineAction(machineId, `status_update`, { status });
    } catch (error) {
      console.error('Error updating machine status:', error);
      throw error;
    }
  }

  async restartMachine(machineId: string): Promise<void> {
    try {
      // First check permissions
      const { data: permission } = await supabase
        .from('machine_permissions')
        .select('access_level')
        .eq('machine_id', machineId)
        .eq('user_id', supabase.auth.getUser())
        .single();

      if (!permission || !['operate', 'admin'].includes(permission.access_level)) {
        throw new Error('Insufficient permissions');
      }

      // Update status to maintenance temporarily
      await this.updateMachineStatus(machineId, 'maintenance');

      // Log the restart action
      await this.logMachineAction(machineId, 'restart');

      // Simulate restart process
      setTimeout(async () => {
        await this.updateMachineStatus(machineId, 'active');
      }, 5000);
    } catch (error) {
      console.error('Error restarting machine:', error);
      throw error;
    }
  }

  async updateMachineMetrics(machineId: string, metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('machine_metrics')
        .insert({
          machine_id: machineId,
          ...metrics,
          timestamp: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating machine metrics:', error);
      throw error;
    }
  }

  private async logMachineAction(
    machineId: string,
    action: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('machine_logs')
        .insert({
          machine_id: machineId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          action,
          details,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging machine action:', error);
      throw error;
    }
  }
}

export const machineControl = new MachineControl();