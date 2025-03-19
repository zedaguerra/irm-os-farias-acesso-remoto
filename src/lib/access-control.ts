import { supabase } from './supabase';
import type { SupportUser } from './support-auth';

export interface AccessRequest {
  id: string;
  deviceId: string;
  supportUser: SupportUser;
  type: 'view' | 'control';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
}

export class AccessControl {
  private static readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  async requestAccess(deviceId: string, supportUser: SupportUser, type: 'view' | 'control'): Promise<AccessRequest> {
    try {
      const { data, error } = await supabase
        .from('support_access_requests')
        .insert({
          device_id: deviceId,
          support_user_id: supportUser.id,
          type,
          status: 'pending',
          expires_at: new Date(Date.now() + AccessControl.SESSION_TIMEOUT)
        })
        .select()
        .single();

      if (error) throw error;

      // Notify device owner
      await this.notifyDeviceOwner(deviceId, supportUser, type);

      return {
        id: data.id,
        deviceId: data.device_id,
        supportUser,
        type: data.type,
        status: data.status,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at)
      };
    } catch (error) {
      console.error('Error requesting access:', error);
      throw error;
    }
  }

  async approveAccess(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_access_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;

      // Log approval in audit trail
      await this.logAccessEvent(requestId, 'approved');
    } catch (error) {
      console.error('Error approving access:', error);
      throw error;
    }
  }

  async rejectAccess(requestId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('support_access_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      // Log rejection in audit trail
      await this.logAccessEvent(requestId, 'rejected');
    } catch (error) {
      console.error('Error rejecting access:', error);
      throw error;
    }
  }

  private async notifyDeviceOwner(deviceId: string, supportUser: SupportUser, type: string) {
    const { data: device } = await supabase
      .from('devices')
      .select('user_id')
      .eq('id', deviceId)
      .single();

    if (device) {
      await supabase.from('notifications').insert({
        user_id: device.user_id,
        type: 'support_access_request',
        title: 'Support Access Request',
        message: `${supportUser.username} is requesting ${type} access to your device`,
        metadata: {
          supportUser: supportUser.username,
          accessType: type
        }
      });
    }
  }

  private async logAccessEvent(requestId: string, action: string) {
    await supabase.from('support_access_logs').insert({
      request_id: requestId,
      action,
      timestamp: new Date().toISOString()
    });
  }
}

export const accessControl = new AccessControl();