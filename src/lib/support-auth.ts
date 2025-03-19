import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { supabase } from './supabase';

export interface SupportUser {
  id: string;
  username: string;
  permissions: string[];
  mfaEnabled: boolean;
}

export async function authenticateSupport(username: string, password: string, mfaToken?: string): Promise<SupportUser> {
  try {
    const { data: user, error } = await supabase
      .from('support_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    if (user.mfa_enabled) {
      if (!mfaToken) {
        throw new Error('MFA token required');
      }

      const validToken = authenticator.verify({
        token: mfaToken,
        secret: user.mfa_secret
      });

      if (!validToken) {
        throw new Error('Invalid MFA token');
      }
    }

    return {
      id: user.id,
      username: user.username,
      permissions: user.permissions,
      mfaEnabled: user.mfa_enabled
    };
  } catch (error) {
    console.error('Support authentication error:', error);
    throw error;
  }
}

export async function generateMFASecret(): Promise<string> {
  return authenticator.generateSecret();
}

export async function validateMFAToken(secret: string, token: string): Promise<boolean> {
  return authenticator.verify({ token, secret });
}