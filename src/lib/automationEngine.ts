import { supabase } from './supabase';

interface AutomationRule {
  id: string;
  device_type: string;
  condition: {
    metric: string;
    operator: '>' | '<' | '==' | '>=' | '<=';
    value: number;
  };
  action: {
    type: 'restart_service' | 'scale_resources' | 'notify';
    params: Record<string, any>;
  };
}

export class AutomationEngine {
  private rules: AutomationRule[] = [];

  async loadRules(deviceType: string) {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('device_type', deviceType);

      if (error) throw error;
      this.rules = data || [];
    } catch (error) {
      console.error('Error loading automation rules:', error);
      throw error;
    }
  }

  async evaluateMetrics(deviceId: string, metrics: Record<string, number>) {
    for (const rule of this.rules) {
      if (this.checkCondition(metrics, rule.condition)) {
        await this.executeAction(deviceId, rule.action);
      }
    }
  }

  private checkCondition(
    metrics: Record<string, number>,
    condition: AutomationRule['condition']
  ): boolean {
    const value = metrics[condition.metric];
    if (value === undefined) return false;

    switch (condition.operator) {
      case '>':
        return value > condition.value;
      case '<':
        return value < condition.value;
      case '==':
        return value === condition.value;
      case '>=':
        return value >= condition.value;
      case '<=':
        return value <= condition.value;
      default:
        return false;
    }
  }

  private async executeAction(deviceId: string, action: AutomationRule['action']) {
    try {
      switch (action.type) {
        case 'restart_service':
          await this.restartService(deviceId, action.params.service);
          break;
        case 'scale_resources':
          await this.scaleResources(deviceId, action.params);
          break;
        case 'notify':
          await this.sendNotification(deviceId, action.params.message);
          break;
      }

      await this.logAutomationAction(deviceId, action);
    } catch (error) {
      console.error('Error executing automation action:', error);
      throw error;
    }
  }

  private async restartService(deviceId: string, service: string) {
    await supabase.functions.invoke('device-ops', {
      body: {
        action: 'restart',
        deviceId,
        service
      }
    });
  }

  private async scaleResources(
    deviceId: string,
    params: { cpu?: number; memory?: number }
  ) {
    await supabase.functions.invoke('device-ops', {
      body: {
        action: 'scale',
        deviceId,
        resources: params
      }
    });
  }

  private async sendNotification(deviceId: string, message: string) {
    const { data: device } = await supabase
      .from('machines')
      .select('owner_id')
      .eq('id', deviceId)
      .single();

    if (!device) return;

    await supabase.from('notifications').insert({
      user_id: device.owner_id,
      type: 'automation',
      message,
      device_id: deviceId
    });
  }

  private async logAutomationAction(
    deviceId: string,
    action: AutomationRule['action']
  ) {
    await supabase.from('machine_logs').insert({
      device_id: deviceId,
      action: 'automation',
      details: {
        type: action.type,
        params: action.params
      }
    });
  }
}